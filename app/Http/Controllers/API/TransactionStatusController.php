<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TransactionStatus;
use Illuminate\Support\Facades\Log;

class TransactionStatusController extends Controller
{
    public function index()
    {
        try {
            $statuses = TransactionStatus::all();
            return response()->json($statuses);
        } catch (\Exception $e) {
            Log::error("Failed to fetch transaction statuses: " . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch transaction statuses', 'error' => $e->getMessage()], 500);
        }
    }
}