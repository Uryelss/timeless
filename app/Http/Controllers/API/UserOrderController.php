<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Shipping;
use App\Models\Address;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserOrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'address_id' => 'sometimes|exists:addresses,id', // Optional, must exist if provided
            'address.street' => 'required_without:address_id|string',
            'address.city' => 'required_without:address_id|string',
            'address.state' => 'required_without:address_id|string',
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

        return DB::transaction(function () use ($request, $profile) {
            // Determine or create the address
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
                        'barangay' =>$addressData['barangay'],
                        'postal_code' => $addressData['postal_code'],
                        'country' => $addressData['country'],
                        'phone' => $addressData['phone'],
                    ]
                );
            }

            // Create order
            $order = Order::create([
                'profile_id' => $profile->id,
                'total_amount' => $request->total,
                'order_status' => 'pending',
                'order_date' => now(),
            ]);

            // Process cart items and update inventory
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
                $inventory->stock_status = $inventory->quantity == 0 ? 'Out of Stock' : ($inventory->quantity < 10 ? 'Low Stock' : 'In Stock');
                $inventory->save();
            }

            // Create shipping record
            $shipping = Shipping::create([
                'order_id' => $order->id,
                'payment_method_id' => $request->payment_method_id,
                'payment_status_id' => 1,
                'address_id' => $address->id,
                'shipping_method_id' => $request->shipping_method_id,
                'shipping_status_id' => 1,
                'shipping_total_amount' => $request->shipping_cost,
            ]);

            $order->update(['shipping_id' => $shipping->id]);

            return response()->json([
                'message' => 'Order created successfully',
                'order_id' => $order->id,
                'address_id' => $address->id, // Optional: Return the address used
            ], 201);
        }, 5);
    }
}
