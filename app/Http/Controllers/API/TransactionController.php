<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $transactions = Transaction::with(['profile', 'order', 'paymentMethod', 'paymentStatus'])
                ->paginate(10);
            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error("Failed to retrieve transactions: {$e->getMessage()}");
            return response()->json(['message' => 'Failed to retrieve transactions'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            try {
                $transaction = Transaction::findOrFail($id);
                $data = $request->validate([
                    'payment_method_id'  => 'sometimes|required|exists:payment_methods,id',
                    'payment_status_id'  => 'sometimes|required|exists:payment_statuses,id',
                    'transaction_status' => 'sometimes|required|string|in:Pending,Completed,Cancelled',
                    // We now rely on payment_option_id instead of payment_option.
                ]);

                // If payment_option_id is not provided, use the default from payment_method_options.
                if (!isset($data['payment_option_id'])) {
                    $defaultOption = DB::table('payment_method_options')
                        ->where('payment_method_id', $data['payment_method_id'])
                        ->orderBy('id', 'asc')
                        ->first();
                    if ($defaultOption) {
                        $data['payment_option_id'] = $defaultOption->id;
                    }
                }

                $transaction->update($data);
                Log::info("Transaction {$id} updated by user {$request->user()->id}");

                if (isset($data['transaction_status']) && $data['transaction_status'] === 'Completed') {
                    $order = $transaction->order;
                    if ($order) {
                        $order->order_status = 'completed';
                        $order->completed_at = now();
                        $order->save();
                        Log::info("Order {$order->id} status set to completed.");
                    } else {
                        Log::warning("Transaction {$id} has no associated order.");
                    }
                }

                return response()->json($transaction);
            } catch (\Exception $e) {
                Log::error("Failed to update transaction {$id}: {$e->getMessage()}");
                return response()->json(['message' => 'Failed to update transaction'], 500);
            }
        });
    }

    public function archive($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            if ($transaction->trashed()) {
                return response()->json(['message' => 'Transaction is already archived'], 400);
            }
            $transaction->delete();
            Log::info("Transaction {$id} archived by user " . auth()->id());
            return response()->json(['message' => 'Transaction archived successfully']);
        } catch (\Exception $e) {
            Log::error("Failed to archive transaction {$id}: {$e->getMessage()}");
            return response()->json(['message' => 'Failed to archive transaction'], 500);
        }
    }

    public function restore($id)
    {
        try {
            $transaction = Transaction::withTrashed()->findOrFail($id);
            if (!$transaction->trashed()) {
                return response()->json(['message' => 'Transaction is not archived'], 400);
            }
            $transaction->restore();
            Log::info("Transaction {$id} restored by user " . auth()->id());
            return response()->json(['message' => 'Transaction restored successfully']);
        } catch (\Exception $e) {
            Log::error("Failed to restore transaction {$id}: {$e->getMessage()}");
            return response()->json(['message' => 'Failed to restore transaction'], 500);
        }
    }
}
