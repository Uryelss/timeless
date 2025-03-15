<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Shipping;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserOrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'address.street' => 'required|string',
            'address.city' => 'required|string',
            'address.state' => 'required|string',
            'address.postal_code' => 'required|string',
            'address.country' => 'required|string',
            'address.phone' => 'required|string',
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

        // Get authenticated user's profile
        $user = Auth::user();
        $profile = $user->profile; // Assuming a `profile` relationship exists in User model

        // Create or update address
        $addressData = $request->input('address');
        $address = Address::updateOrCreate(
            ['profile_id' => $profile->id, 'street' => $addressData['street']],
            [
                'city' => $addressData['city'],
                'state' => $addressData['state'],
                'postal_code' => $addressData['postal_code'],
                'country' => $addressData['country'],
                'phone' => $addressData['phone'],
            ]
        );

        // Create order
        $order = Order::create([
            'profile_id' => $profile->id,
            'total_amount' => $request->total,
            'order_status' => 'pending',
            'order_date' => now(),
        ]);

        // Create order details
        foreach ($request->cart_items as $item) {
            OrderDetail::create([
                'order_id' => $order->id,
                'product_id' => $item['id'],
                'inventory_id' => $item['inventory_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        // Create shipping record
        $shipping = Shipping::create([
            'order_id' => $order->id,
            'payment_method_id' => $request->payment_method_id,
            'payment_status_id' => 1, // Assuming 1 = "Pending"
            'address_id' => $address->id,
            'shipping_method_id' => $request->shipping_method_id,
            'shipping_status_id' => 1, // Assuming 1 = "Pending"
            'shipping_total_amount' => $request->shipping_cost,
        ]);

        $order->update(['shipping_id' => $shipping->id]);

        return response()->json([
            'message' => 'Order created successfully',
            'order_id' => $order->id,
        ], 201);
    }
}