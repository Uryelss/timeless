<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    /**
     * List all transactions with related profile, order, payment method, and payment status details.
     */
    public function index(Request $request)
    {
        try {
            $query = Transaction::with(['profile', 'order', 'paymentMethod', 'paymentStatus']);

            // Optionally include archived transactions
            if ($request->query('archived')) {
                $query->onlyTrashed();
            } else {
                $query->withTrashed(); // Include both active and soft-deleted by default
            }

            $transactions = $query->get();
            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error("Failed to fetch transactions: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a transaction (except total_amount since it comes from the order)
     */
    public function update(Request $request, $id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            $data = $request->validate([
                'payment_method_id'  => 'sometimes|required|exists:payment_methods,id',
                'payment_status_id'  => 'sometimes|required|exists:payment_statuses,id',
                'transaction_status' => 'sometimes|required|string',
                'payment_option'     => 'nullable|string|max:255'
            ]);
            $transaction->update($data);
            return response()->json($transaction->fresh(['paymentMethod', 'paymentStatus']));
        } catch (\Exception $e) {
            Log::error("Transaction update failed: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive (soft delete) a transaction
     */
    public function archive($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            $transaction->delete();
            return response()->json(['message' => 'Transaction archived successfully']);
        } catch (\Exception $e) {
            Log::error("Transaction archive failed: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to archive transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore an archived transaction
     */
    public function restore($id)
    {
        try {
            $transaction = Transaction::withTrashed()->findOrFail($id);
            $transaction->restore();
            return response()->json(['message' => 'Transaction restored successfully']);
        } catch (\Exception $e) {
            Log::error("Transaction restore failed: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to restore transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}