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
use Illuminate\Support\Facades\Log;


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
            'product_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'movement_id' => 'required|exists:movements,id',
            'strap_material_id' => 'required|exists:strap_materials,id',
            'gender_id' => 'required|exists:genders,id',
            'size_id' => 'required|exists:sizes,id',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // ✅ Store file properly
            $imagePath = $request->file('product_image')->store('products', 'public');

            $product = Product::create([
                'product_name' => $request->product_name,
                'product_image' => $imagePath, // ✅ Correctly stored path
                'brand_id' => $request->brand_id,
                'category_id' => $request->category_id,
                'movement_id' => $request->movement_id,
                'strap_material_id' => $request->strap_material_id,
                'gender_id' => $request->gender_id,
                'size_id' => $request->size_id,
                'price' => $request->price,
            ]);

            return response()->json([
                'message' => 'Product added successfully',
                'product' => $product
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function update(Request $request, $id)
    {
        // Fetch the product
        $product = Product::findOrFail($id);

        // Validate input
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'movement_id' => 'required|exists:movements,id',
            'strap_material_id' => 'required|exists:strap_materials,id',
            'gender_id' => 'required|exists:genders,id',
            'size_id' => 'required|exists:sizes,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'nullable|integer|min:1', // ✅ Allow nullable
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update product
        $product->update($request->all());

        return response()->json(['message' => 'Product updated successfully', 'product' => $product], 200);
    }



    public function archive($id)
    {
        $product = Product::findOrFail($id);
        $product->delete(); // ✅ Soft delete

        return response()->json(['message' => 'Product archived successfully'], 200);
    }
    public function archivedProducts()
    {
        $archivedProducts = Product::onlyTrashed()->with([
            'brand',
            'category',
            'movement',
            'strapMaterial',
            'gender',
            'size'
        ])->get();

        return response()->json($archivedProducts, 200);
    }

    public function restore($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore(); // ✅ Restore product

        return response()->json(['message' => 'Product restored successfully'], 200);
    }
}
