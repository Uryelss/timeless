<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Address;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    // Create a new order (for checkout)
    public function store(Request $request)
    {
        try {
            // Validate incoming request data
            $validatedData = $request->validate([
                'address.country'       => 'required|string',
                'address.streetAddress' => 'required|string',
                'address.barangay'      => 'required|string',
                'address.province'      => 'required|string',
                'address.city'          => 'required|string',
                'address.postalCode'    => 'required|string',
                'address.phone'         => 'required|string',
                'cartItems'             => 'required|array',
                'subtotal'              => 'required|numeric',
                'shippingCost'          => 'required|numeric',
                'total'                 => 'required|numeric',
                'paymentMethod'         => 'required|string',
                'shippingMethod'        => 'required|string',
                'userId'                => 'required|integer',
            ]);

            // Create the address record first
            $address = Address::create([
                'profile_id'     => $validatedData['userId'],
                'country'        => $validatedData['address']['country'],
                'street_address' => $validatedData['address']['streetAddress'],
                'barangay'       => $validatedData['address']['barangay'],
                'province'       => $validatedData['address']['province'],
                'city'           => $validatedData['address']['city'],
                'postal_code'    => $validatedData['address']['postalCode'],
                'phone'          => $validatedData['address']['phone'],
            ]);

            // Map shipping method to shipping priority
            $shippingPriority = $validatedData['shippingMethod'] === 'expedited' ? 'expedited' : 'standard';

            // Create the order using the new address id
            $order = Order::create([
                'profile_id'        => $validatedData['userId'],
                'profile_name'      => 'Test User', // Replace with the actual profile name when available
                'address_id'        => $address->id,
                'items'             => $validatedData['cartItems'],
                'shipping_priority' => $shippingPriority,
                'status'            => 'pending',
                'total_amount'      => $validatedData['total'],
                'order_date'        => now(),
            ]);

            return response()->json(['orderId' => $order->id, 'message' => 'Order created successfully'], 201);
        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Order creation failed'], 500);
        }
    }

    // List orders
    public function index()
    {
        $orders = Order::orderBy('order_date', 'desc')->get();
        return response()->json($orders);
    }

    // Show a specific order
    public function show($id)
    {
        $order = Order::findOrFail($id);
        return response()->json($order);
    }

    // Update an order
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->all());
        return response()->json($order);
    }

    // Archive an order (soft delete)
    public function archive($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order archived successfully']);
    }
}