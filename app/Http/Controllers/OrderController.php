<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Get all orders
    public function index()
    {
        $orders = Order::all();

        // Ensure items are decoded from JSON to array before sending
        foreach ($orders as $order) {
            $order->items = json_decode($order->items, true);
        }

        return response()->json($orders);
    }


    // Store new order (checkout simulation)
    public function store(Request $request)
    {
        $order = Order::create([
            'customer_name' => $request->customer_name,
            'items' => json_encode($request->items),
            'priority' => $request->priority,
            'total_amount' => $request->total_amount,
        ]);

        return response()->json(['message' => 'Order placed successfully', 'order' => $order]);
    }

    // Update order status
    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $order->update(['order_status' => $request->order_status]);
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
