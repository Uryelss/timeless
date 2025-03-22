<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;

class PaymentMethodController extends Controller
{
    public function index()
    {
        // Check if the user is authenticated.
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
        $paymentMethods = PaymentMethod::with('options')->get();
        return response()->json($paymentMethods);
    }
}