<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'orderDetails.product',
        ]); // Removed 'orderStatus'

        if ($request->query('archived')) {
            $query->onlyTrashed();
        } else {
            $query->withTrashed();
        }

        $orders = $query->get();
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'orderDetails.product',
        ]) // Removed 'orderStatus'
            ->withTrashed()
            ->findOrFail($id);

        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        try {
            $order = Order::withTrashed()->findOrFail($id);

            $request->validate([
                'order_status' => 'sometimes|in:pending,processing,shipped,delivered,cancelled', // Define valid statuses
                'shipping.shipping_status_id' => 'sometimes|exists:shipping_statuses,id',
            ]);

            // Update order_status as a string
            $order->order_status = $request->input('order_status', $order->order_status);

            // Check if shipping exists; create it if not
            if (!$order->shipping) {
                $order->shipping()->create([
                    'order_id' => $order->id,
                    'payment_method_id' => 1,
                    'payment_status_id' => 1,
                    'address_id' => $order->profile->address_id ?? 1,
                    'shipping_method_id' => 1,
                    'shipping_status_id' => $request->input('shipping.shipping_status_id', 1),
                    'shipping_total_amount' => 0,
                ]);
            }

            // Automatically generate tracking number when order_status is "shipped"
            if ($order->order_status === 'shipped' && !$order->shipping->tracking_number) {
                $date = now()->format('Ymd');
                $random = strtoupper(substr(uniqid(), -5));
                $trackingNumber = "TRK-{$date}-{$random}";
                $order->shipping->tracking_number = $trackingNumber;
                $order->shipping->save();
            }

            // Update shipping status ID if provided
            if ($request->has('shipping.shipping_status_id')) {
                $order->shipping->shipping_status_id = $request->input('shipping.shipping_status_id');
                $order->shipping->save();
            }

            $order->save();

            $order->load([
                'profile.user',
                'shipping.shippingMethod',
                'shipping.paymentMethod',
                'shipping.address',
                'orderDetails.product',
            ]); // Removed 'orderStatus'

            return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
        } catch (\Exception $e) {
            Log::error("Order update failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to update order', 'error' => $e->getMessage()], 500);
        }
    }

    public function archive($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order archived successfully']);
    }

    public function restore($id)
    {
        $order = Order::withTrashed()->findOrFail($id);
        $order->restore();
        return response()->json(['message' => 'Order restored successfully']);
    }

    public function userOrders(Request $request)
    {
        $user = $request->user();
        $orders = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'orderDetails.product',
        ]) // Removed 'orderStatus'
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->get();

        return response()->json($orders);
    }

    // Replace getOrderStatuses with a hardcoded list since there's no table
    public function getOrderStatuses()
    {
        try {
            $statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']; // Adjust as needed
            return response()->json($statuses);
        } catch (\Exception $e) {
            Log::error("Failed to fetch order statuses: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch order statuses'], 500);
        }
    }
}