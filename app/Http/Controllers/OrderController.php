<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Get all orders
    public function index()
    {
        $orders = Order::all(); // Fetch all orders from the database
        return response()->json($orders);
    }


    // Store a new order
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'customer_name' => 'required|string',
            'items' => 'required|array',
            'priority' => 'required|string',
            'order_status' => 'required|string',
            'total_amount' => 'required|numeric',
            'customer_details' => 'nullable|json',
            'payment_information' => 'nullable|json',
        ]);

        $order = Order::create($validatedData);

        return response()->json($order, 201);
    }

    // Update order
    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $order->update($request->all());
        return response()->json(['message' => 'Order updated successfully']);
    }

    // Archive order (soft delete)
    public function destroy($id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $order->delete();
        return response()->json(['message' => 'Order archived successfully']);
    }

    // View order details
    public function show($id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        return response()->json($order);
    }
}
