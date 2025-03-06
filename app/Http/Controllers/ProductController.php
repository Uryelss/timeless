<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory; // ✅ Ensure Inventory model is imported
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
            'strapMaterial',
            'gender',
            'size'
        ])->get();

        return response()->json($products, 200);
    }

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
            'quantity' => 'required|integer|min:1',
            'description' => 'required|string',
            'product_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // ✅ Store Image
            $imagePath = $request->file('product_image')->store('products', 'public');

            // ✅ Create Product


            // Create the product (keep other fields as before)
            $product = Product::create([
                'product_name' => $request->product_name,
                'product_image' => $imagePath,
                'brand_id' => $request->brand_id,
                'category_id' => $request->category_id,
                'movement_id' => $request->movement_id,
                'strap_material_id' => $request->strap_material_id,
                'gender_id' => $request->gender_id,
                // Instead of size_id, you now expect an array of size IDs:
                'price' => $request->price,
                'quantity' => $request->quantity,
                'description' => $request->description
            ]);

            // If a product is created and the request has an array of size_ids, attach them:
            if ($product && $request->has('size_ids')) {
                $product->sizes()->attach($request->size_ids);
            }


            // ✅ Ensure the product is created before adding to inventory
            if ($product) {
                Inventory::create([
                    'product_id' => $product->id,
                    'product_image' => $imagePath,
                    'product_name' => $request->product_name,
                    'stock_quantity' => $product->quantity, // ✅ Sync with product's "quantity"
                    'sold' => 0,
                    'stock_status' => $product->quantity > 0 ? 'In Stock' : 'Out of Stock',
                ]);
            }


            return response()->json([
                'message' => 'Product and Inventory added successfully',
                'product' => $product
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add product',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
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
            'description' => 'required|string',
            'product_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // ✅ Keep the old image if no new image is uploaded
            $imagePath = $product->product_image;

            if ($request->hasFile('product_image')) {
                // ✅ Delete the old image if it exists
                if ($product->product_image && Storage::exists('public/' . $product->product_image)) {
                    Storage::delete('public/' . $product->product_image);
                }

                // ✅ Upload the new image
                $imagePath = $request->file('product_image')->store('products', 'public');
            }

            // ✅ Update the Product
            $product->update([
                'product_name' => $request->product_name,
                'product_image' => $imagePath,
                'brand_id' => $request->brand_id,
                'category_id' => $request->category_id,
                'movement_id' => $request->movement_id,
                'strap_material_id' => $request->strap_material_id,
                'gender_id' => $request->gender_id,
                'size_id' => $request->size_id,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'description' => $request->description
            ]);
            if ($request->has('size_ids')) {
                $product->sizes()->sync($request->size_ids);
            }

            // ✅ Sync the Inventory Table with the updated Product Data
            Inventory::where('product_id', $product->id)->update([
                'product_name' => $request->product_name, // ✅ Update name in inventory
                'product_image' => $imagePath, // ✅ Update image in inventory
                'stock_quantity' => $request->quantity, // ✅ Update stock quantity
                'stock_status' => $request->quantity > 0 ? 'In Stock' : 'Out of Stock', // ✅ Update stock status
            ]);

            return response()->json(['message' => 'Product and Inventory updated successfully', 'product' => $product], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function archive($id)
    {
        $product = Product::findOrFail($id);

        if ($product->deleted_at !== null) {
            return response()->json(['message' => 'Product is already archived'], 400);
        }

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
        $product->restore();
        $product->deleted_at = null;
        $product->save();

        return response()->json(['message' => 'Product restored successfully'], 200);
    }

    //userpage
    public function getActiveProducts()
    {
        $products = Product::whereNull('deleted_at')
            ->with(['brand', 'gender', 'movement', 'strapMaterial', 'reviews']) // add reviews here
            ->select('id', 'product_name as name', 'price', 'product_image', 'brand_id', 'gender_id', 'movement_id', 'strap_material_id')
            ->get()
            ->map(function ($product) {
                $average_rating = count($product->reviews) > 0
                    ? number_format($product->reviews->avg('rating'), 1)
                    : 0;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image' => $product->product_image
                        ? asset('storage/' . $product->product_image)
                        : asset('default-product.png'),
                    'brand' => $product->brand->name ?? '',
                    'gender' => $product->gender->name ?? '',
                    'movement' => $product->movement->name ?? '',
                    'strap_material' => $product->strapMaterial->name ?? '',
                    'average_rating' => $average_rating,
                ];
            });

        return response()->json($products, 200);
    }

    public function getProductOverview($id)
    {
        $product = Product::with(['sizes', 'reviews.user.profile'])->findOrFail($id);
        $averageRating = $product->reviews()->avg('rating') ?? 0;

        return response()->json([
            'product' => [
                'id' => $product->id,
                'product_name' => $product->product_name,
                'product_image' => asset('storage/' . $product->product_image),
                'price' => $product->price,
                'description' => $product->description,
                'size' => $product->sizes, // Return all available sizes
                'average_rating' => number_format($averageRating, 1),
            ],
            'reviews' => $product->reviews->map(function ($review) {
                $profileImage = $review->user->profile && $review->user->profile->profile_image
                    ? asset('storage/' . ltrim($review->user->profile->profile_image, '/'))
                    : asset('default-profile.png');

                return [
                    'rating' => $review->rating,
                    'review' => $review->review,
                    'user' => [
                        'username' => $review->user->username ?? 'Anonymous',
                        'profile_image' => $profileImage,
                    ]
                ];
            })
        ]);
    }
}
