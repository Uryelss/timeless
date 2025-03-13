<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductViewController extends Controller
{
    // Fetch product details by ID
    public function show($id)
    {
        // Fetch the product with its related relationships and reviews
        $product = Product::with(['brand', 'gender', 'movement', 'strapMaterial', 'reviews'])
            ->findOrFail($id);

        return response()->json([
            'product' => $product,
        ]);
    }
}
