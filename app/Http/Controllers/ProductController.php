<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Movement;
use App\Models\StrapMaterial;
use App\Models\Gender;
use App\Models\Size;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with([
            'brand',
            'category',
            'movement',
            'strapMaterial', // ✅ Ensure this is included
            'gender',
            'size'
        ])->get();

        return response()->json($products, 200);
    }



    // ✅ Rename this function to match frontend API call
    public function create()
    {
        return response()->json([
            'brands' => Brand::all(),
            'categories' => Category::all(),
            'movements' => Movement::all(),
            'strapMaterials' => StrapMaterial::all(),
            'genders' => Gender::all(),
            'sizes' => Size::all()
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'movement_id' => 'required|exists:movements,id',
            'strap_material_id' => 'required|exists:strap_materials,id',
            'gender_id' => 'required|exists:genders,id',
            'size_id' => 'required|exists:sizes,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1', // ✅ Ensure quantity is required
            'product_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            $imagePath = $request->file('product_image')->store('products', 'public');

            $product = Product::create([
                'product_name' => $request->product_name,
                'product_image' => $imagePath,
                'brand_id' => $request->brand_id,
                'category_id' => $request->category_id,
                'movement_id' => $request->movement_id,
                'strap_material_id' => $request->strap_material_id,
                'gender_id' => $request->gender_id,
                'size_id' => $request->size_id,
                'price' => $request->price,
                'quantity' => $request->quantity, // ✅ Save quantity
            ]);

            return response()->json(['message' => 'Product added successfully', 'product' => $product], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to add product', 'error' => $e->getMessage()], 500);
        }
    }

    //updatee
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // ✅ Validate fields (image is now optional)
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'movement_id' => 'required|exists:movements,id',
            'strap_material_id' => 'required|exists:strap_materials,id',
            'gender_id' => 'required|exists:genders,id',
            'size_id' => 'required|exists:sizes,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'product_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // ✅ Image is optional
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // ✅ Check if a new image is uploaded
            if ($request->hasFile('product_image')) {
                // Delete the old image if it exists
                Storage::delete($product->product_image);
                // Store new image
                $imagePath = $request->file('product_image')->store('products', 'public');
                $product->product_image = $imagePath;
            }

            // ✅ Update product details
            $product->update([
                'product_name' => $request->product_name,
                'brand_id' => $request->brand_id,
                'category_id' => $request->category_id,
                'movement_id' => $request->movement_id,
                'strap_material_id' => $request->strap_material_id,
                'gender_id' => $request->gender_id,
                'size_id' => $request->size_id,
                'price' => $request->price,
                'quantity' => $request->quantity,
            ]);

            return response()->json(['message' => 'Product updated successfully', 'product' => $product], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update product', 'error' => $e->getMessage()], 500);
        }
    }
}
