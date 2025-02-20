<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Fetch all products
    public function index()
    {
        return response()->json(Product::all());
    }

    // Store a new product
    public function store(Request $request)
    {
        $request->validate([
            'product_name' => 'required',
            'price' => 'required|numeric',
            'category' => 'required',
            'brand' => 'required',
            'movement' => 'required',
            'strap_material' => 'required',
            'gender' => 'required',
            'size' => 'required',
            'product_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('product_image')) {
            $imagePath = $request->file('product_image')->store('products', 'public');
        } else {
            $imagePath = null;
        }

        $product = Product::create([
            'product_name' => $request->product_name,
            'price' => $request->price,
            'category' => $request->category,
            'brand' => $request->brand,
            'movement' => $request->movement,
            'strap_material' => $request->strap_material,
            'gender' => $request->gender,
            'size' => $request->size,
            'product_image' => $imagePath,
        ]);

        return response()->json($product);
    }

    // Update product
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'product_name' => 'required',
            'price' => 'required|numeric',
            'category' => 'required',
            'brand' => 'required',
            'movement' => 'required',
            'strap_material' => 'required',
            'gender' => 'required',
            'size' => 'required',
        ]);

        if ($request->hasFile('product_image')) {
            Storage::delete('public/' . $product->product_image);
            $imagePath = $request->file('product_image')->store('products', 'public');
            $product->product_image = $imagePath;
        }

        $product->update($request->all());

        return response()->json($product);
    }

    // Archive (soft delete) a product
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product archived successfully']);
    }
}
