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
            'statusHistory',
        ]);

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
            'statusHistory',
        ])->withTrashed()->findOrFail($id);

        $timestamps = $order->statusHistory
            ->groupBy('status')
            ->map(function ($group) {
                return $group->sortByDesc('timestamp')->first()->timestamp;
            });

        return response()->json([
            'id' => $order->id,
            'profile_id' => $order->profile_id,
            'shipping_id' => $order->shipping_id,
            'total_amount' => $order->total_amount,
            'order_status' => $order->order_status,
            'order_date' => $order->order_date,
            'created_at' => $order->order_date ?? $order->created_at,
            'payment_confirmed_at' => $timestamps['processing'] ?? null,
            'shipped_at' => $timestamps['shipped'] ?? null,
            'delivered_at' => $timestamps['delivered'] ?? null,
            'completed_at' => $timestamps['completed'] ?? null,
            'shipping' => $order->shipping,
            'order_details' => $order->orderDetails,
            'status_history' => $order->statusHistory, // Included for debugging or additional use
            'deleted_at' => $order->deleted_at,
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $order = Order::withTrashed()->findOrFail($id);

            $request->validate([
                'order_status' => 'sometimes|in:pending,processing,shipped,delivered,completed,cancelled',
                'shipping.shipping_status_id' => 'sometimes|exists:shipping_statuses,id',
            ]);

            if ($request->has('order_status')) {
                $newStatus = $request->input('order_status');
                $order->updateStatus($newStatus, $request->input('details', 'Updated by admin'));
            }

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

            if ($order->order_status === 'shipped' && !$order->shipping->tracking_number) {
                $date = now()->format('Ymd');
                $random = strtoupper(substr(uniqid(), -5));
                $trackingNumber = "TRK-{$date}-{$random}";
                $order->shipping->tracking_number = $trackingNumber;
                $order->shipping->save();
            }

            if ($request->has('shipping')) {
                $shippingData = $request->input('shipping');
                $order->shipping->update([
                    'tracking_number' => $shippingData['tracking_number'] ?? $order->shipping->tracking_number,
                    'shipping_status_id' => $shippingData['shipping_status_id'] ?? $order->shipping->shipping_status_id,
                ]);
            }

            $order->save();

            return $this->show($id);
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
            'statusHistory',
        ])
            ->whereHas('profile', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereNull('deleted_at')
            ->get();

        return response()->json(
            $orders->map(function ($order) {
                $timestamps = $order->statusHistory
                    ->groupBy('status')
                    ->map(function ($group) {
                        return $group->sortByDesc('timestamp')->first()->timestamp;
                    });

                return [
                    'id' => $order->id,
                    'profile_id' => $order->profile_id,
                    'shipping_id' => $order->shipping_id,
                    'total_amount' => $order->total_amount,
                    'order_status' => $order->order_status,
                    'order_date' => $order->order_date,
                    'created_at' => $order->order_date ?? $order->created_at,
                    'payment_confirmed_at' => $timestamps['processing'] ?? null,
                    'shipped_at' => $timestamps['shipped'] ?? null,
                    'delivered_at' => $timestamps['delivered'] ?? null,
                    'completed_at' => $timestamps['completed'] ?? null,
                    'shipping' => $order->shipping,
                    'order_details' => $order->orderDetails,
                ];
            })
        );
    }

    public function getOrderStatuses()
    {
        try {
            $statuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
            return response()->json($statuses);
        } catch (\Exception $e) {
            Log::error("Failed to fetch order statuses: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch order statuses'], 500);
        }
    }

    public function confirmReceipt($id)
    {
        $order = Order::findOrFail($id);
        $order->updateStatus('delivered', 'Customer confirmed receipt');
        return $this->show($id);
    }

    public function cancelOrder($id, Request $request)
    {
        $request->validate(['reason' => 'required|string']);
        $order = Order::findOrFail($id);
        $order->updateStatus('cancelled', $request->input('reason'));
        return $this->show($id);
    }
}