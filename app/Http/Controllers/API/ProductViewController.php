<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductViewController extends Controller
{
    // Fetch product details by ID
    public function show($id)
    {
        // Fetch the product with its related relationships (without ratings and reviews)
        $product = Product::with(['brand', 'gender', 'movement', 'strapMaterial'])
            ->findOrFail($id);

        return response()->json([
            'product' => $product,
        ]);
    }
}
