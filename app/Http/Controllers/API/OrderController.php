<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Courier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

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
            'courier',
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
            'courier',
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

            switch ($shippingStatusId) {
                case 1:
                    $order->order_status = 'pending';
                    break;
                case 2:
                    $order->payment_confirmed_at = $order->payment_confirmed_at ?? now();
                    $order->order_status = 'pending';
                    break;
                case 3:
                    $order->shipped_at = $order->shipped_at ?? now();
                    $order->order_status = 'processing';
                    if (!$order->shipping->tracking_number) {
                        $date = now()->format('Ymd');
                        $random = strtoupper(substr(uniqid(), -5));
                        $order->shipping->tracking_number = "TRK-{$date}-{$random}";
                        $order->shipping->save();
                    }
                    break;
                case 4:
                    $order->delivered_at = $order->delivered_at ?? now();
                    $order->order_status = 'shipped';
                    break;
                case 5:
                    $order->order_status = 'cancelled';
                    break;
                case 6:
                    $order->completed_at = $order->completed_at ?? now();
                    $order->order_status = 'completed';
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
                'courier',
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
            'courier',
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
            $order->cancel_reason = $request->input('reason');
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
                'courier',
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
            // Validate the transfer_method
            $request->validate([
                'transfer_method' => 'required|in:GCash,PayMaya,Bank Transfer,Cash',
            ]);

            // Find the order with related data
            $order = Order::with(['shipping', 'shipping.paymentMethod', 'courier'])
                ->whereHas('profile', function ($query) {
                    $query->where('user_id', Auth::id());
                })
                ->findOrFail($id);

            // Check if shipping details exist
            if (!$order->shipping) {
                return response()->json(['error' => 'Shipping details not found for this order'], 404);
            }

            // Check if the order is in a confirmable state (delivered)
            if ($order->shipping->shipping_status_id != 4) {
                return response()->json(['error' => 'Order cannot be confirmed at this stage'], 400);
            }

            // Update order status to completed
            $order->completed_at = now();
            $order->order_status = 'completed';
            $order->shipping->update(['shipping_status_id' => 6]);
            $order->save();

            // Update courier's transfer_method and total_transferred
            if ($order->courier_id) {
                $courier = Courier::findOrFail($order->courier_id);
                $courier->transfer_method = $request->input('transfer_method');
                $courier->total_transferred += $order->total_amount;
                $courier->save();
                Log::info("Courier {$courier->id} transfer method updated to {$request->input('transfer_method')} and total_transferred incremented by {$order->total_amount} for order {$id}");
            }

            Log::info("Order {$id} receipt confirmed by user " . Auth::id());

            // Reload order with related data
            $order->load([
                'profile.user',
                'shipping.shippingMethod',
                'shipping.paymentMethod',
                'shipping.address',
                'shipping.shippingStatus',
                'orderDetails.product',
                'courier',
            ]);

            return response()->json([
                'message' => 'Order receipt confirmed successfully',
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
            Log::error("Confirm receipt failed for order {$id}: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to confirm receipt',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function unassignedOrders(Request $request)
    {
        try {
            $orders = Order::with(['profile.user', 'orderDetails.product'])
                ->whereNull('courier_id')
                ->whereNull('deleted_at')
                ->whereIn('order_status', ['pending', 'processing'])
                ->get()
                ->map(function ($order) {
                    $orderTotal = 0;
                    $products = $order->orderDetails->map(function ($detail) use (&$orderTotal) {
                        $product = $detail->product;
                        $subtotal = $detail->quantity * ($detail->price ?? $product->price);
                        $orderTotal += $subtotal;
                        return [
                            'name' => $product->product_name,
                            'quantity' => $detail->quantity,
                            'price' => $detail->price ?? $product->price,
                            'subtotal' => $subtotal,
                        ];
                    });

                    return [
                        'id' => $order->id,
                        'user' => $order->profile->user->name ?? 'N/A',
                        'products' => $products,
                        'total_amount' => $orderTotal,
                        'order_date' => $order->order_date->toISOString(),
                    ];
                });

            return response()->json($orders);
        } catch (\Exception $e) {
            Log::error("Failed to fetch unassigned orders: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch unassigned orders'], 500);
        }
    }

    public function assignCourier(Request $request, $orderId)
    {
        try {
            $request->validate([
                'courier_id' => 'required|exists:couriers,id',
            ]);

            $order = Order::with('shipping')->findOrFail($orderId);
            if ($order->courier_id) {
                return response()->json(['error' => 'Order is already assigned to a courier'], 400);
            }

            $order->courier_id = $request->courier_id;
            $order->order_status = 'processing';
            $order->save();

            if ($order->shipping) {
                $order->shipping->update(['shipping_status_id' => 3]);
            }

            Log::info("Order {$orderId} assigned to courier {$request->courier_id}");
            return response()->json(['message' => 'Order assigned successfully']);
        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error("Failed to assign order {$orderId}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to assign order'], 500);
        }
    }

    public function assignCourierAuto(Request $request, $orderId)
    {
        try {
            $order = Order::with('shipping')->findOrFail($orderId);
            if ($order->courier_id) {
                return response()->json(['error' => 'Order is already assigned to a courier'], 400);
            }

            $courier = Courier::where('status', 'active')
                ->withCount('orders')
                ->orderBy('orders_count', 'asc')
                ->first();

            if (!$courier) {
                return response()->json(['error' => 'No active couriers available'], 404);
            }

            $order->courier_id = $courier->id;
            $order->order_status = 'processing';
            $order->save();

            if ($order->shipping) {
                $order->shipping->update(['shipping_status_id' => 3]);
            }

            Log::info("Order {$orderId} automatically assigned to courier {$courier->id}");
            return response()->json([
                'message' => 'Courier assigned successfully',
                'courier' => $courier,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to auto-assign courier for order {$orderId}: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to assign courier',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}