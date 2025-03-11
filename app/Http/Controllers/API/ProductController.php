<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    // Public endpoint to fetch products with brand relationship
    public function publicIndex()
    {
        $products = Product::with(['brand', 'gender', 'movement', 'strapMaterial'])->get();
        return response()->json($products);
    }


    // Admin endpoint: List active products or archived ones if requested via query param.
    public function index(Request $request)
    {
        if ($request->query('archived')) {
            $products = Product::onlyTrashed()->get();
        } else {
            $products = Product::all();
        }
        return response()->json($products);
    }

    // Store a new product
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'product_name'       => 'required|string',
            'brand_id'           => 'required|integer',
            'category_id'        => 'required|integer',
            'movement_id'        => 'required|integer',
            'strap_material_id'  => 'required|integer',
            'gender_id'          => 'required|integer',
            'price'              => 'required|numeric',
            'quantity'           => 'required|integer',
            'description'        => 'required|string',
            'sizes'              => 'required', // JSON string, e.g., '["21mm", "22mm"]'
            'main_image'         => 'required|file|image',
            'side_image_1'       => 'nullable|file|image',
            'side_image_2'       => 'nullable|file|image',
            'side_image_3'       => 'nullable|file|image',
        ]);

        // Handle file uploads
        if ($request->hasFile('main_image')) {
            $validatedData['main_image'] = $request->file('main_image')->store('products', 'public');
        }
        foreach (['side_image_1', 'side_image_2', 'side_image_3'] as $field) {
            if ($request->hasFile($field)) {
                $validatedData[$field] = $request->file($field)->store('products', 'public');
            }
        }

        // Create the product
        $product = Product::create($validatedData);

        // Decode sizes (ensure sizes is a valid JSON array)
        $sizes = $product->sizes;
        if (is_string($sizes)) {
            $sizes = json_decode($sizes, true);
        }

        // For each size, create an inventory record.
        if (is_array($sizes)) {
            foreach ($sizes as $size) {
                \App\Models\Inventory::create([
                    'product_id'   => $product->id,
                    'size'         => $size,
                    'quantity'     => $product->quantity,
                    'sold'         => 0,
                    'stock_status' => $product->quantity == 0 ? 'Out of Stock' : 'In Stock',
                ]);
            }
        }

        return response()->json($product, 201);
    }

    // Update an existing product
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Use "sometimes|required" to allow missing fields on update.
        $validatedData = $request->validate([
            'product_name'       => 'sometimes|required|string',
            'brand_id'           => 'sometimes|required|integer',
            'category_id'        => 'sometimes|required|integer',
            'movement_id'        => 'sometimes|required|integer',
            'strap_material_id'  => 'sometimes|required|integer',
            'gender_id'          => 'sometimes|required|integer',
            'price'              => 'sometimes|required|numeric',
            'quantity'           => 'sometimes|required|integer',
            'description'        => 'sometimes|required|string',
            'sizes'              => 'sometimes|required',
            'main_image'         => 'nullable|file|image',
            'side_image_1'       => 'nullable|file|image',
            'side_image_2'       => 'nullable|file|image',
            'side_image_3'       => 'nullable|file|image',
        ]);

        if ($request->hasFile('main_image')) {
            $validatedData['main_image'] = $request->file('main_image')->store('products', 'public');
        }
        foreach (['side_image_1', 'side_image_2', 'side_image_3'] as $field) {
            if ($request->hasFile($field)) {
                $validatedData[$field] = $request->file($field)->store('products', 'public');
            }
        }

        Log::info("Updating product $id", $validatedData);
        $product->update($validatedData);
        return response()->json($product);
    }

    // Archive (soft delete) a product
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product archived successfully']);
    }

    // Restore a soft-deleted product
    public function restore($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();
        return response()->json(['message' => 'Product restored successfully']);
    }
}
