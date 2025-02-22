<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Fetch All Products (Not Archived)
    public function index()
    {
        return response()->json(Product::whereNull('deleted_at')->get());
    }

    // Store New Product
    public function store(Request $request)
    {
        $request->validate([
            'product_image' => 'required|image|mimes:jpeg,png,jpg,gif',
            'product_name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'brand' => 'required|string',
            'movement' => 'required|string',
            'strap_material' => 'required|string',
            'gender' => 'required|string',
            'size' => 'required|string',
        ]);

        if ($request->hasFile('product_image')) {
            $imagePath = $request->file('product_image')->store('product_images', 'public');
        } else {
            return response()->json(['error' => 'Image upload failed'], 400);
        }

        $product = Product::create([
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

        return response()->json(['message' => 'Product added successfully', 'product' => $product]);
    }

    // Update Product
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        // If there is an image file in the request, replace the existing one
        if ($request->hasFile('product_image')) {
            Storage::disk('public')->delete($product->product_image);  // Delete old image
            $imagePath = $request->file('product_image')->store('product_images', 'public');  // Store new image
            $product->product_image = $imagePath;
        }

        // Update the rest of the fields
        $product->update([
            'product_name' => $request->product_name,
            'price' => $request->price,
            'category' => $request->category,
            'brand' => $request->brand,
            'movement' => $request->movement,
            'strap_material' => $request->strap_material,
            'gender' => $request->gender,
            'size' => $request->size,
        ]);

        return response()->json(['message' => 'Product updated successfully']);
    }

    // Soft Delete (Move to Archive)
    public function archive($id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        $product->delete();
        return response()->json(['message' => 'Product archived successfully']);
    }

    // Fetch Archived Products
    public function archived()
    {
        return response()->json(Product::onlyTrashed()->get());
    }


    // Restore Archived Product
    public function restore($id)
    {
        $product = Product::onlyTrashed()->find($id);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        $product->restore();
        return response()->json(['message' => 'Product restored successfully']);
    }
}
