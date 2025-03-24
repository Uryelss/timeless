<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Retrieve a list of all orders with related data.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'shipping.shippingStatus',
            'orderDetails.product',
        ]);

        if ($request->query('archived')) {
            $query->onlyTrashed(); // Show only archived (soft-deleted) orders
        } else {
            $query->withTrashed(); // Include both active and archived orders
        }

        $orders = $query->get();
        return response()->json($orders);
    }

    /**
     * Retrieve a specific order by ID with related data.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $order = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'shipping.shippingStatus',
            'orderDetails.product',
        ])
            ->withTrashed()
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update an order, including its shipping status and timestamps.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // Load the order with its shipping relationship
            $order = Order::with('shipping')->withTrashed()->findOrFail($id);
            Log::info('Update Request Data:', $request->all());

            // Validate incoming request data
            $request->validate([
                'shipping.shipping_status_id' => 'sometimes|exists:shipping_statuses,id',
                'shipping.tracking_number' => 'sometimes|string|nullable',
            ]);

            // Prepare shipping data
            $shippingData = [
                'shipping_status_id' => $request->input('shipping.shipping_status_id', 1),
                'tracking_number' => $request->input('shipping.tracking_number', null),
                'order_id' => $order->id,
                'payment_method_id' => 1, // Default value; adjust as needed
                'payment_status_id' => 1, // Default value; adjust as needed
                'address_id' => $order->profile->address_id ?? 1, // Fallback to 1 if null
                'shipping_method_id' => 1, // Default value; adjust as needed
                'shipping_total_amount' => 0, // Default value; adjust as needed
            ];

            // Create or update shipping record
            if (!$order->shipping) {
                Log::info("Creating new shipping record for order {$id}");
                $order->shipping()->create($shippingData);
            } else {
                Log::info("Updating existing shipping record for order {$id}");
                $order->shipping->update([
                    'shipping_status_id' => $shippingData['shipping_status_id'],
                    'tracking_number' => $shippingData['tracking_number'],
                ]);
            }

            // Update timestamps based on shipping status
            switch ($request->input('shipping.shipping_status_id')) {
                case 2: // Payment Confirmed
                    $order->payment_confirmed_at = $order->payment_confirmed_at ?? now();
                    break;
                case 3: // Shipped
                    $order->shipped_at = $order->shipped_at ?? now();
                    if (!$order->shipping->tracking_number) {
                        $date = now()->format('Ymd');
                        $random = strtoupper(substr(uniqid(), -5));
                        $order->shipping->tracking_number = "TRK-{$date}-{$random}";
                        $order->shipping->save();
                    }
                    break;
                case 4: // Delivered
                    $order->delivered_at = $order->delivered_at ?? now();
                    break;
                case 5: // Cancelled
                    $order->order_status = 'cancelled';
                    break;
            }

            // Save the order
            $order->save();

            // Reload related data
            $order->load([
                'profile.user',
                'shipping.shippingMethod',
                'shipping.paymentMethod',
                'shipping.address',
                'shipping.shippingStatus',
                'orderDetails.product',
            ]);

            return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
        } catch (\Exception $e) {
            Log::error("Order update failed for order {$id}: " . $e->getMessage() . "\nStack trace: " . $e->getTraceAsString());
            return response()->json(['message' => 'Failed to update order', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Archive (soft delete) an order.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function archive($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order archived successfully']);
    }

    /**
     * Restore a soft-deleted order.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        $order = Order::withTrashed()->findOrFail($id);
        $order->restore();
        return response()->json(['message' => 'Order restored successfully']);
    }

    /**
     * Retrieve all active orders for the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function userOrders(Request $request)
    {
        $user = $request->user();
        $orders = Order::with([
            'profile.user',
            'shipping.shippingMethod',
            'shipping.paymentMethod',
            'shipping.address',
            'shipping.shippingStatus',
            'orderDetails.product',
        ])
            ->where('user_id', $user->id)
            ->whereNull('deleted_at') // Only active orders
            ->get();

        return response()->json($orders);
    }
}
