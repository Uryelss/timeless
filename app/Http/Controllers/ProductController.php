<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Fetch active products
    public function index()
    {
        return response()->json(Product::whereNull('deleted_at')->get());
    }

    // Store a new product
    public function store(Request $request)
    {
        $request->validate([
            'product_image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'product_name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'movement' => 'required|string|max:255',
            'strap_material' => 'required|string|max:255',
            'gender' => 'required|string|max:255',
            'size' => 'required|string|max:255',
        ]);

        if ($request->hasFile('product_image')) {
            $imagePath = $request->file('product_image')->store('products', 'public');
        } else {
            return response()->json(['message' => 'Product image is required!'], 400);
        }

        $product = new Product([
            'product_image' => $imagePath,
            'product_name' => $request->product_name,
            'price' => $request->price,
            'category' => $request->category,
            'brand' => $request->brand,
            'movement' => $request->movement,
            'strap_material' => $request->strap_material,
            'gender' => $request->gender,
            'size' => $request->size,
        ]);

        if ($product->save()) {
            return response()->json(['message' => 'Product saved successfully!'], 200);
        }

        return response()->json(['message' => 'Failed to save product!'], 500);
    }

    // Update a product
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'product_name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'brand' => 'required|string',
            'movement' => 'nullable|string',
            'strap_material' => 'nullable|string',
            'gender' => 'required|string',
            'size' => 'required|string',
            'product_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image update
        if ($request->hasFile('product_image')) {
            // Delete old image if exists
            if ($product->product_image) {
                Storage::disk('public')->delete($product->product_image);
            }
            $imagePath = $request->file('product_image')->store('uploads', 'public');
            $product->product_image = $imagePath;
        }

        // Update product details
        $product->update($request->except('product_image'));

        return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
    }

    // Soft delete (archive) a product
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product archived successfully']);
    }

    // Fetch archived (soft deleted) products
    public function archived()
    {
        return response()->json(Product::onlyTrashed()->get());
    }

    // Restore archived product
    public function restore($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();
        return response()->json(['message' => 'Product restored successfully']);
    }
}
