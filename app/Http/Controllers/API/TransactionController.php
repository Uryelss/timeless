<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
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
            $query = Transaction::with([
                'profile' => fn($q) => $q->withTrashed(),
                'order' => fn($q) => $q->withTrashed(),
                'paymentMethod',
                'paymentStatus'
            ]);

            if ($request->query('archived') == 1) {
                $query->onlyTrashed();
            }

            $transactions = $query->paginate(10);
            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error("Failed to retrieve transactions: {$e->getMessage()}", ['exception' => $e]);
            return response()->json(['message' => 'Unable to retrieve transactions'], 500);
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
                Log::info("Updating transaction {$id}", ['data' => $request->all()]);

                $data = $request->validate([
                    'payment_method'     => 'sometimes|required|string|exists:payment_methods,name',
                    'payment_status'     => 'sometimes|required|string|exists:payment_statuses,name',
                    'transaction_status' => 'sometimes|required|string|in:Pending,Completed,Cancelled',
                ]);

                if (isset($data['payment_method'])) {
                    $paymentMethod = PaymentMethod::where('name', $data['payment_method'])->firstOrFail();
                    $transaction->payment_method_id = $paymentMethod->id;
                }

                if (isset($data['payment_status'])) {
                    $paymentStatus = PaymentStatus::where('name', $data['payment_status'])->firstOrFail();
                    $transaction->payment_status_id = $paymentStatus->id;
                }

                if (isset($data['transaction_status'])) {
                    $transaction->transaction_status = $data['transaction_status'];
                }

                $transaction->save();
                Log::info("Transaction {$id} updated successfully", ['transaction' => $transaction->toArray()]);

                if (isset($data['transaction_status']) && $data['transaction_status'] === 'Completed') {
                    $order = $transaction->order;
                    if ($order) {
                        $order->order_status = 'completed';
                        $order->completed_at = now();
                        $order->save();
                        Log::info("Order {$order->id} marked as completed");
                    } else {
                        Log::warning("No order associated with transaction {$id}");
                    }
                }

                return response()->json($transaction->load('paymentMethod', 'paymentStatus'));
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error("Validation failed for transaction {$id}: " . json_encode($e->errors()), [
                    'request_data' => $request->all()
                ]);
                return response()->json([
                    'message' => 'Unable to update transaction',
                    'error' => 'The given data was invalid.',
                    'details' => $e->errors()
                ], 422);
            } catch (\Exception $e) {
                Log::error("Failed to update transaction {$id}: {$e->getMessage()}", [
                    'exception' => $e,
                    'request_data' => $request->all()
                ]);
                return response()->json([
                    'message' => 'Unable to update transaction',
                    'error' => $e->getMessage()
                ], 500);
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
            Log::info("Transaction {$id} archived", ['user_id' => auth()->id()]);
            return response()->json(['message' => 'Transaction archived successfully']);
        } catch (\Exception $e) {
            Log::error("Failed to archive transaction {$id}: {$e->getMessage()}", ['exception' => $e]);
            return response()->json(['message' => 'Unable to archive transaction'], 500);
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
            Log::info("Transaction {$id} restored", ['user_id' => auth()->id()]);
            return response()->json(['message' => 'Transaction restored successfully']);
        } catch (\Exception $e) {
            Log::error("Failed to restore transaction {$id}: {$e->getMessage()}", ['exception' => $e]);
            return response()->json(['message' => 'Unable to restore transaction'], 500);
        }
    }
}
