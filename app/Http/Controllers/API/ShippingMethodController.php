<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    public function index()
    {
        try {
            $shippingMethods = ShippingMethod::all();
            return response()->json($shippingMethods);
        } catch (\Exception $e) {
            \Log::error("Shipping methods fetch failed: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch shipping methods'], 500);
        }
    }
}