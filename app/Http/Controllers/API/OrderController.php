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
            'shipping.shippingStatus',
            'orderDetails.product',
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
            'shipping.shippingStatus',
            'orderDetails.product',
        ])
            ->withTrashed()
            ->findOrFail($id);

        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        try {
            // Load the order with its shipping relationship
            $order = Order::with('shipping')->withTrashed()->findOrFail($id);
            Log::info('Update Request Data:', $request->all());

            $request->validate([
                'shipping.shipping_status_id' => 'sometimes|exists:shipping_statuses,id',
                'shipping.tracking_number' => 'sometimes|string|nullable',
            ]);

            $shippingData = [
                'shipping_status_id' => $request->input('shipping.shipping_status_id', 1),
                'tracking_number' => $request->input('shipping.tracking_number', null),
                'order_id' => $order->id,
                'payment_method_id' => 1,
                'payment_status_id' => 1,
                'address_id' => $order->profile->address_id ?? 1,
                'shipping_method_id' => 1,
                'shipping_total_amount' => 0,
            ];

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

            switch ($request->input('shipping.shipping_status_id')) {
                case 2:
                    $order->payment_confirmed_at = $order->payment_confirmed_at ?? now();
                    break;
                case 3:
                    $order->shipped_at = $order->shipped_at ?? now();
                    if (!$order->shipping->tracking_number) {
                        $date = now()->format('Ymd');
                        $random = strtoupper(substr(uniqid(), -5));
                        $order->shipping->tracking_number = "TRK-{$date}-{$random}";
                        $order->shipping->save();
                    }
                    break;
                case 4:
                    $order->delivered_at = $order->delivered_at ?? now();
                    break;
                case 5:
                    $order->order_status = 'cancelled';
                    break;
            }

            $order->save();

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
            'shipping.shippingStatus',
            'orderDetails.product',
        ])
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->get();

        return response()->json($orders);
    }
}