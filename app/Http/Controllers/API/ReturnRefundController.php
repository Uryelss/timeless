<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ReturnRefund;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Shipping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReturnRefundController extends Controller
{
    public function index(Request $request, $archived = false)
    {
        $user = Auth::user();
        if (!$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = $archived ? ReturnRefund::onlyTrashed() : ReturnRefund::query();
        $requests = $query->with([
            'order',
            'profile' => function ($query) {
                $query->withTrashed();
            }
        ])->paginate(10); // Added pagination

        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->profile) {
            return response()->json(['error' => 'User profile not found'], 400);
        }

        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'issue_type' => 'required|in:received_with_issues,not_received',
            'products' => 'required|json',
            'reason' => 'required|in:missing_part,wrong_item,damaged,defective',
            'refund_method' => 'required|in:gcash,reorder',
            'refund_amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'policy_confirmed' => 'required|boolean',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('profile_id', $user->profile->id)
            ->where('order_status', 'completed')
            ->firstOrFail();

        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('return_images', 'public');
                $images[] = $path;
            }
        }

        $returnRefund = ReturnRefund::create([
            'order_id' => $order->id,
            'profile_id' => $user->profile->id,
            'issue_type' => $request->issue_type,
            'products' => $request->products,
            'reason' => $request->reason,
            'refund_method' => $request->refund_method,
            'refund_amount' => $request->refund_amount,
            'description' => $request->description,
            'images' => json_encode($images),
            'policy_confirmed' => $request->policy_confirmed,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Return/Refund request created successfully',
            'request' => $returnRefund,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,approved,denied,completed',
            'admin_comments' => 'nullable|string',
        ]);

        $returnRefund = ReturnRefund::findOrFail($id);
        $originalOrder = Order::with('orderDetails')->findOrFail($returnRefund->order_id);

        DB::beginTransaction();

        try {
            $returnRefund->status = $request->status;
            $returnRefund->admin_comments = $request->admin_comments;
            $returnRefund->save();

            $newOrderId = null;

            // Automatic reorder on approval with reorder method
            if ($request->status === 'approved' && $returnRefund->refund_method === 'reorder') {
                // Create new shipping record
                $newShipping = Shipping::create([
                    'order_id' => null,
                    'shipping_status_id' => 1,
                    'tracking_number' => null,
                    'payment_method_id' => $originalOrder->shipping->payment_method_id ?? 1,
                    'payment_status_id' => 1,
                    'address_id' => $originalOrder->shipping->address_id ?? 1,
                    'shipping_method_id' => $originalOrder->shipping->shipping_method_id ?? 1,
                    'shipping_total_amount' => $originalOrder->shipping->shipping_total_amount ?? 0,
                ]);

                // Create new order
                $newOrder = Order::create([
                    'profile_id' => $returnRefund->profile_id,
                    'total_amount' => $returnRefund->refund_amount,
                    'order_status' => 'pending',
                    'order_date' => now(),
                    'shipping_id' => $newShipping->id,
                    'payment_confirmed_at' => now(),
                    'courier_id' => $originalOrder->courier_id,
                ]);

                // Update shipping with new order ID
                $newShipping->order_id = $newOrder->id;
                $newShipping->save();

                // Replicate order details
                $products = json_decode($returnRefund->products, true);
                foreach ($products as $product) {
                    $originalDetail = $originalOrder->orderDetails->firstWhere('id', $product['id']);
                    if ($originalDetail) {
                        OrderDetail::create([
                            'order_id' => $newOrder->id,
                            'product_id' => $originalDetail->product_id,
                            'inventory_id' => $originalDetail->inventory_id,
                            'quantity' => $product['quantity'],
                            'price' => $originalDetail->price,
                        ]);
                    }
                }

                // Mark return/refund as completed
                $returnRefund->status = 'completed';
                $returnRefund->save();

                $newOrderId = $newOrder->id;

                // Update original order status if completed
                $originalOrder->order_status = 'return/refunded';
                $originalOrder->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Return/Refund request updated successfully',
                'request' => $returnRefund,
                'new_order_id' => $newOrderId,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to update return/refund {$id}: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update request',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function archive($id)
    {
        $user = Auth::user();
        if (!$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $returnRefund = ReturnRefund::findOrFail($id);
        $returnRefund->delete();

        return response()->json([
            'message' => 'Return/Refund request archived successfully',
        ]);
    }

    public function restore($id)
    {
        $user = Auth::user();
        if (!$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $returnRefund = ReturnRefund::onlyTrashed()->findOrFail($id);
        $returnRefund->restore();

        return response()->json([
            'message' => 'Return/Refund request restored successfully',
        ]);
    }

    public function stats()
    {
        $user = Auth::user();
        if (!$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $approvedCount = ReturnRefund::where('status', 'approved')->count();

        return response()->json([
            'total_returns_refunds' => $approvedCount,
        ]);
    }

    public function userRequests()
    {
        $user = Auth::user();
        if (!$user->profile) {
            return response()->json(['error' => 'User profile not found'], 400);
        }

        $requests = ReturnRefund::where('profile_id', $user->profile->id)
            ->with(['order', 'profile'])
            ->paginate(10); // Added pagination

        return response()->json($requests);
    }
}