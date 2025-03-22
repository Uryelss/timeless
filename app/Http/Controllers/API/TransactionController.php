<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Transaction::with(['profile', 'order', 'paymentMethod', 'paymentStatus']);
            if ($request->query('archived')) {
                $query->onlyTrashed();
            } else {
                $query->withTrashed();
            }
            $transactions = $query->get();
            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error("Failed to fetch transactions: " . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch transactions', 'error' => $e->getMessage()], 500);
        }
    }

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

            // Sync order status if payment is completed for Digital Wallet or Credit Card
            if (
                in_array($transaction->payment_method_id, [2, 3]) && // Credit Card (2), Digital Wallet (3)
                isset($data['payment_status_id']) && $data['payment_status_id'] === 2 // Completed
            ) {
                $order = Order::find($transaction->order_id);
                if ($order && $order->order_status !== 'processing') {
                    $order->updateStatus('processing', 'Payment confirmed via Transaction Management');
                }
            }

            return response()->json($transaction->fresh(['paymentMethod', 'paymentStatus']));
        } catch (\Exception $e) {
            Log::error("Transaction update failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to update transaction', 'error' => $e->getMessage()], 500);
        }
    }

    public function archive($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            $transaction->delete();
            return response()->json(['message' => 'Transaction archived successfully']);
        } catch (\Exception $e) {
            Log::error("Transaction archive failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to archive transaction', 'error' => $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {
        try {
            $transaction = Transaction::withTrashed()->findOrFail($id);
            $transaction->restore();
            return response()->json(['message' => 'Transaction restored successfully']);
        } catch (\Exception $e) {
            Log::error("Transaction restore failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to restore transaction', 'error' => $e->getMessage()], 500);
        }
    }
}