<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Shipping;
use App\Models\Address;
use App\Models\Inventory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UserOrderController extends Controller
{
    public function index(Request $request)
    {
        // Ensure only admins can access (adjust based on your auth logic)
        $user = Auth::user();
        if (!$user || !$user->hasRole('admin')) { // Example role check, replace with your logic
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $orders = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'shipping.shippingStatus',
            'orderDetails.product',
            'orderDetails.inventory',
        ])
            ->latest('order_date') // Sort by most recent first
            ->get()
            ->map(function ($order) {
                $profileImage = $order->profile && $order->profile->profile_image
                    ? (str_starts_with($order->profile->profile_image, 'http')
                        ? $order->profile->profile_image
                        : Storage::url($order->profile->profile_image))
                    : null;

                return [
                    'id' => $order->id,
                    'profile' => $order->profile ? [
                        'first_name' => $order->profile->first_name ?? 'N/A',
                        'last_name' => $order->profile->last_name ?? 'N/A',
                        'profile_image' => $profileImage,
                    ] : null,
                    'total_amount' => $order->total_amount,
                    'order_status' => $order->order_status,
                    'order_date' => $order->order_date->toISOString(),
                    'deleted_at' => $order->deleted_at ? $order->deleted_at->toISOString() : null,
                    'shipping' => $order->shipping ? [
                        'payment_method' => $order->shipping->paymentMethod ? [
                            'name' => $order->shipping->paymentMethod->name,
                        ] : null,
                    ] : null,
                ];
            });

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'address_id' => 'sometimes|exists:addresses,id',
            'address.street' => 'required_without:address_id|string',
            'address.city' => 'required_without:address_id|string',
            'address.state' => 'required_without:address_id|string',
            'address.barangay' => 'required_without:address_id|string',
            'address.postal_code' => 'required_without:address_id|string',
            'address.country' => 'required_without:address_id|string',
            'address.phone' => 'required_without:address_id|string',
            'cart_items' => 'required|array',
            'cart_items.*.id' => 'required|exists:products,id',
            'cart_items.*.inventory_id' => 'required|exists:inventory,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.price' => 'required|numeric',
            'subtotal' => 'required|numeric',
            'shipping_cost' => 'required|numeric',
            'total' => 'required|numeric',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
        ]);

        $user = Auth::user();
        $profile = $user->profile;

        return DB::transaction(function () use ($request, $profile, $user) {
            if ($request->has('address_id')) {
                $address = Address::findOrFail($request->address_id);
            } else {
                $addressData = $request->input('address');
                $address = Address::updateOrCreate(
                    [
                        'profile_id' => $profile->id,
                        'street' => $addressData['street'],
                    ],
                    [
                        'city' => $addressData['city'],
                        'state' => $addressData['state'],
                        'barangay' => $addressData['barangay'],
                        'postal_code' => $addressData['postal_code'],
                        'country' => $addressData['country'],
                        'phone' => $addressData['phone'],
                    ]
                );
            }

            $order = Order::create([
                'profile_id' => $profile->id,
                'total_amount' => $request->total,
                'order_status' => 'pending',
                'order_date' => now(),
            ]);

            foreach ($request->cart_items as $item) {
                $inventory = Inventory::findOrFail($item['inventory_id']);
                if ($inventory->quantity < $item['quantity']) {
                    throw new \Exception(
                        "Insufficient stock for {$inventory->product->product_name} (Size: {$inventory->size}). Available: {$inventory->quantity}"
                    );
                }

                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'inventory_id' => $item['inventory_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                $inventory->quantity -= $item['quantity'];
                $inventory->sold += $item['quantity'];
                $inventory->stock_status = $inventory->quantity == 0
                    ? 'Out of Stock'
                    : ($inventory->quantity < 10 ? 'Low Stock' : 'In Stock');
                $inventory->save();
            }

            $shipping = Shipping::create([
                'order_id' => $order->id,
                'payment_method_id' => $request->payment_method_id,
                'payment_status_id' => 1, // Pending
                'address_id' => $address->id,
                'shipping_method_id' => $request->shipping_method_id,
                'shipping_status_id' => 1, // Order Placed
                'shipping_total_amount' => $request->shipping_cost,
            ]);

            $order->update(['shipping_id' => $shipping->id]);

            Transaction::create([
                'profile_id' => $profile->id,
                'order_id' => $order->id,
                'payment_method_id' => $request->payment_method_id,
                'payment_status_id' => 1, // Pending
                'transaction_status' => 'pending',
                'payment_option' => $request->payment_option ?? null,
            ]);

            $order->load([
                'profile.user',
                'shipping.shippingMethod',
                'shipping.paymentMethod',
                'shipping.address',
                'shipping.shippingStatus',
                'orderDetails.product',
                'orderDetails.inventory',
            ]);

            return response()->json([
                'message' => 'Order created successfully',
                'order_id' => $order->id,
                'address_id' => $address->id,
                'order' => $order,
            ], 201);
        }, 5);
    }

    public function myPurchases(Request $request)
    {
        $user = $request->user();
        $orderId = $request->query('order_id');

        $query = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'shipping.shippingStatus',
            'orderDetails.product',
            'orderDetails.inventory',
        ])
            ->whereHas('profile', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereNull('deleted_at');

        if ($orderId) {
            $query->where('id', $orderId);
        }

        $orders = $query->get();

        if ($orderId && $orders->isEmpty()) {
            return response()->json(['error' => 'Order not found or not yours'], 404);
        }

        return response()->json($orderId ? $orders->first() : $orders);
    }
}