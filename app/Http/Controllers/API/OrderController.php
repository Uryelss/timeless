<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Fetch all orders for admin
    public function index(Request $request)
    {
        $query = Order::with([
            'profile.user', // Include user for username and email
            'shipping.shippingMethod', // Shipping method details
            'shipping.paymentMethod', // Payment method for COD, etc.
            'orderDetails.product', // Product details for order summary
        ]);

        if ($request->query('archived')) {
            $query->onlyTrashed();
        } else {
            $query->withTrashed(); // Still include trashed for flexibility
        }

        $orders = $query->get();
        return response()->json($orders);
    }

    // Show a specific order
    public function show($id)
    {
        $order = Order::with([
            'profile.user', // User details (username, email)
            'shipping.shippingMethod', // Shipping method
            'shipping.paymentMethod', // Payment method (COD, etc.)
            'shipping.address', // Address for phone (if stored there)
            'orderDetails.product', // Product details
        ])
            ->withTrashed()
            ->findOrFail($id);

        return response()->json($order);
    }

    // Update order status or details
    public function update(Request $request, $id)
    {
        $order = Order::withTrashed()->findOrFail($id);

        $request->validate([
            'order_status' => 'sometimes|in:pending,completed,cancelled,processing',
            'shipping.tracking_number' => 'sometimes|string',
            'shipping.shipping_status_id' => 'sometimes|exists:shipping_statuses,id',
        ]);

        $order->update($request->only('order_status'));
        if ($request->has('shipping')) {
            $order->shipping->update($request->input('shipping'));
        }

        return response()->json(['message' => 'Order updated successfully', 'order' => $order->fresh()]);
    }

    // Archive (soft delete) an order
    public function archive($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Order archived successfully']);
    }

    // Restore an archived order
    public function restore($id)
    {
        $order = Order::withTrashed()->findOrFail($id);
        $order->restore();

        return response()->json(['message' => 'Order restored successfully']);
    }
}
