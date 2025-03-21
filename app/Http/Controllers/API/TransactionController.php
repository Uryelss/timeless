<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;

class TransactionController extends Controller
{
    // List all transactions with related profile, order, payment method, and payment status details.
    public function index(Request $request)
    {
        $transactions = Transaction::with(['profile', 'order', 'paymentMethod', 'paymentStatus'])->get();
        return response()->json($transactions);
    }

    // Update a transaction (except total_amount since it comes from the order)
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        $data = $request->validate([
            'payment_method_id'  => 'sometimes|required|exists:payment_methods,id',
            'payment_status_id'  => 'sometimes|required|exists:payment_statuses,id',
            'transaction_status' => 'sometimes|required|string',
            'payment_option'     => 'nullable|string'
        ]);
        $transaction->update($data);
        return response()->json($transaction);
    }

    // Archive (soft delete) a transaction
    public function archive($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();
        return response()->json(['message' => 'Transaction archived successfully']);
    }

    // Restore an archived transaction
    public function restore($id)
    {
        $transaction = Transaction::withTrashed()->findOrFail($id);
        $transaction->restore();
        return response()->json(['message' => 'Transaction restored successfully']);
    }
}