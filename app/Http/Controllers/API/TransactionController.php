<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Retrieve a paginated list of transactions.
     * Supports fetching archived transactions if 'archived=1' is passed.
     */
    public function index(Request $request)
    {
        try {
            if ($request->query('archived') == 1) {
                // Fetch only soft-deleted (archived) transactions
                $transactions = Transaction::withTrashed()
                    ->onlyTrashed()
                    ->with(['profile', 'order', 'paymentMethod', 'paymentStatus'])
                    ->paginate(10);
            } else {
                // Fetch active transactions
                $transactions = Transaction::with(['profile', 'order', 'paymentMethod', 'paymentStatus'])
                    ->paginate(10);
            }
            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error("Failed to retrieve transactions: {$e->getMessage()}");
            return response()->json(['message' => 'Failed to retrieve transactions'], 500);
        }
    }

    /**
     * Update a transaction's details.
     * Allows updating payment status independently of transaction status.
     */
    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            try {
                $transaction = Transaction::findOrFail($id);
                $data = $request->validate([
                    'payment_method_id'  => 'sometimes|required|exists:payment_methods,id',
                    'payment_status_id'  => 'sometimes|required|exists:payment_statuses,id',
                    'transaction_status' => 'sometimes|required|string|in:Pending,Completed,Cancelled',
                ]);

                // Update the transaction with validated data
                $transaction->update($data);
                Log::info("Transaction {$id} updated by user {$request->user()->id}");

                // If transaction status is set to "Completed", update the associated order
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

    /**
     * Archive a transaction (soft delete).
     */
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

    /**
     * Restore an archived transaction.
     */
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
