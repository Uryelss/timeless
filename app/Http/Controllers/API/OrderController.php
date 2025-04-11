<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

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
            $order = Order::with('shipping')->withTrashed()->findOrFail($id);
            Log::info('Update Request Data:', $request->all());

            $request->validate([
                'shipping.shipping_status_id' => 'sometimes|required|exists:shipping_statuses,id',
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

            $shippingStatusId = $request->input('shipping.shipping_status_id');

            // Update order status based on shipping status ID:
            switch ($shippingStatusId) {
                case 1: // Order Placed
                    $order->order_status = 'pending'; // Shows as "To Pay"
                    break;
                case 2: // Payment Info Confirmed
                    $order->payment_confirmed_at = $order->payment_confirmed_at ?? now();
                    $order->order_status = 'pending'; // Also "To Pay"
                    break;
                case 3: // Shipped
                    $order->shipped_at = $order->shipped_at ?? now();
                    $order->order_status = 'processing'; // Will show as "To Ship"
                    if (!$order->shipping->tracking_number) {
                        $date = now()->format('Ymd');
                        $random = strtoupper(substr(uniqid(), -5));
                        $order->shipping->tracking_number = "TRK-{$date}-{$random}";
                        $order->shipping->save();
                    }
                    break;
                case 4: // Delivered
                    $order->delivered_at = $order->delivered_at ?? now();
                    $order->order_status = 'shipped'; // Maps to "To Receive"
                    break;
                case 5: // Cancelled
                    $order->order_status = 'cancelled'; // Maps to "Cancelled"
                    break;
                case 6: // Completed
                    $order->completed_at = $order->completed_at ?? now();
                    $order->order_status = 'completed'; // Maps to "Completed"
                    if (!$order->shipping->tracking_number) {
                        $date = now()->format('Ymd');
                        $random = strtoupper(substr(uniqid(), -5));
                        $order->shipping->tracking_number = "TRK-{$date}-{$random}";
                        $order->shipping->save();
                    }
                    break;
                default:
                    $order->order_status = $order->order_status ?? 'pending';
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
            Log::error("Order update failed for order {$id}: " . $e->getMessage());
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
            ->whereHas('profile', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereNull('deleted_at')
            ->get();

        return response()->json($orders);
    }

    public function cancel(Request $request, $id)
    {
        try {
            $user = $request->user();

            $order = Order::with('shipping')
                ->whereNull('deleted_at')
                ->whereHas('profile', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->findOrFail($id);

            $request->validate([
                'reason' => 'required|string|max:255',
            ]);

            if (!in_array($order->shipping->shipping_status_id, [1, 2, 3])) {
                return response()->json(['error' => 'Order cannot be canceled at this stage'], 400);
            }

            $order->shipping->update([
                'shipping_status_id' => 5,
                'updated_at' => now(),
            ]);

            $order->order_status = 'cancelled';
            $order->updated_at = now();
            $order->save();

            Log::info("Order {$id} cancelled by user {$user->id}. Reason: " . $request->input('reason'));

            $order->load([
                'profile.user',
                'shipping.shippingMethod',
                'shipping.paymentMethod',
                'shipping.address',
                'shipping.shippingStatus',
                'orderDetails.product',
            ]);

            return response()->json([
                'message' => 'Order cancelled successfully',
                'order' => $order,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Order not found or not yours'], 404);
        } catch (\Exception $e) {
            Log::error("Order cancellation failed for order {$id}: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to cancel order',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    public function confirmReceipt(Request $request, $id)
    {
        try {
            // Retrieve the order along with its shipping details
            $order = Order::with('shipping')->findOrFail($id);

            if (!$order->shipping) {
                return response()->json(['error' => 'Shipping details not found for this order.'], 404);
            }

            // Ensure that the order is delivered.
            // For example, assume shipping_status_id 4 means delivered.
            if ($order->shipping->shipping_status_id != 4) {
                return response()->json(['error' => 'Order is not delivered yet.'], 400);
            }

            // Update the order as completed.
            $order->completed_at = now();
            $order->order_status = 'completed';

            // Update the shipping record to indicate "completed"
            // (for example, assuming 6 is the status for completed)
            $order->shipping->update(['shipping_status_id' => 6]);
            $order->save();

            Log::info("Order {$id} receipt confirmed by user.");
            return response()->json([
                'message' => 'Order receipt confirmed successfully',
                'order'   => $order
            ]);
        } catch (\Exception $e) {
            Log::error("Confirm receipt failed for order {$id}: " . $e->getMessage());
            return response()->json([
                'error'   => 'Failed to confirm receipt',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
