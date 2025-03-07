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
            'sizes'  // use "sizes" (plural)
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
            'size_ids' => 'required|array',
            'size_ids.*' => 'exists:sizes,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'description' => 'required|string',
            'product_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'side_image1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'side_image2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'side_image3' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // Upload main image
            $imagePath = $request->file('product_image')->store('products', 'public');

            // Upload side images (if provided)
            $sideImage1 = $request->hasFile('side_image1')
                ? $request->file('side_image1')->store('products', 'public')
                : null;
            $sideImage2 = $request->hasFile('side_image2')
                ? $request->file('side_image2')->store('products', 'public')
                : null;
            $sideImage3 = $request->hasFile('side_image3')
                ? $request->file('side_image3')->store('products', 'public')
                : null;

            // Create the product
            $product = Product::create([
                'product_name' => $request->product_name,
                'product_image' => $imagePath,
                'brand_id' => $request->brand_id,
                'category_id' => $request->category_id,
                'movement_id' => $request->movement_id,
                'strap_material_id' => $request->strap_material_id,
                'gender_id' => $request->gender_id,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'description' => $request->description,
                'side_image1' => $sideImage1,
                'side_image2' => $sideImage2,
                'side_image3' => $sideImage3,
            ]);

            if ($product && $request->has('size_ids')) {
                $product->sizes()->attach($request->size_ids);
            }

            // Create Inventory record...
            Inventory::create([
                'product_id' => $product->id,
                'product_image' => $imagePath,
                'product_name' => $request->product_name,
                'stock_quantity' => $product->quantity,
                'sold' => 0,
                'stock_status' => $product->quantity > 0 ? 'In Stock' : 'Out of Stock',
            ]);

            return response()->json([
                'message' => 'Product and Inventory added successfully',
                'product' => array_merge($product->toArray(), [
                    'price' => number_format($product->price, 0, '.', ',')
                ])
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
            'size_ids' => 'required|array',
            'size_ids.*' => 'exists:sizes,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'description' => 'required|string',
            'product_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'side_image1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'side_image2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'side_image3' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // Use existing image if no new file is provided
            $imagePath = $product->product_image;
            if ($request->hasFile('product_image')) {
                if ($product->product_image && Storage::exists('public/' . $product->product_image)) {
                    Storage::delete('public/' . $product->product_image);
                }
                $imagePath = $request->file('product_image')->store('products', 'public');
            }

            // For side images, only update if a new file is provided. Otherwise, keep the old one.
            $sideImage1 = $product->side_image1;
            if ($request->hasFile('side_image1')) {
                if ($product->side_image1 && Storage::exists('public/' . $product->side_image1)) {
                    Storage::delete('public/' . $product->side_image1);
                }
                $sideImage1 = $request->file('side_image1')->store('products', 'public');
            }
            $sideImage2 = $product->side_image2;
            if ($request->hasFile('side_image2')) {
                if ($product->side_image2 && Storage::exists('public/' . $product->side_image2)) {
                    Storage::delete('public/' . $product->side_image2);
                }
                $sideImage2 = $request->file('side_image2')->store('products', 'public');
            }
            $sideImage3 = $product->side_image3;
            if ($request->hasFile('side_image3')) {
                if ($product->side_image3 && Storage::exists('public/' . $product->side_image3)) {
                    Storage::delete('public/' . $product->side_image3);
                }
                $sideImage3 = $request->file('side_image3')->store('products', 'public');
            }

            $product->update([
                'product_name' => $request->product_name,
                'product_image' => $imagePath,
                'brand_id' => $request->brand_id,
                'category_id' => $request->category_id,
                'movement_id' => $request->movement_id,
                'strap_material_id' => $request->strap_material_id,
                'gender_id' => $request->gender_id,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'description' => $request->description,
                'side_image1' => $sideImage1,
                'side_image2' => $sideImage2,
                'side_image3' => $sideImage3,
            ]);

            if ($request->has('size_ids')) {
                $product->sizes()->sync($request->size_ids);
            }

            Inventory::where('product_id', $product->id)->update([
                'product_name' => $request->product_name,
                'product_image' => $imagePath,
                'stock_quantity' => $request->quantity,
                'stock_status' => $request->quantity > 0 ? 'In Stock' : 'Out of Stock',
            ]);

            return response()->json([
                'message' => 'Product and Inventory updated successfully',
                'product' => array_merge($product->toArray(), [
                    'price' => number_format($product->price, 0, '.', ',')
                ])
            ], 201);
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
            'sizes' // Updated from 'size'
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
            ->with(['brand', 'gender', 'movement', 'strapMaterial', 'sizes']) // load sizes
            ->select('id', 'product_name as name', 'price', 'product_image', 'brand_id', 'gender_id', 'movement_id', 'strap_material_id')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => number_format($product->price, 0, '.', ','),
                    'image' => $product->product_image
                        ? asset('storage/' . $product->product_image)
                        : asset('default-product.png'),
                    'brand' => $product->brand->name ?? '',
                    'gender' => $product->gender->name ?? '',
                    'movement' => $product->movement->name ?? '',
                    'strap_material' => $product->strapMaterial->name ?? '',
                    'sizes' => count($product->sizes) > 0
                        ? implode(", ", $product->sizes->pluck('name')->toArray())
                        : "N/A",
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
                'id'              => $product->id,
                'product_name'    => $product->product_name,
                'product_image'   => asset('storage/' . $product->product_image),
                'side_image1'     => $product->side_image1 ? asset('storage/' . $product->side_image1) : null,
                'side_image2'     => $product->side_image2 ? asset('storage/' . $product->side_image2) : null,
                'side_image3'     => $product->side_image3 ? asset('storage/' . $product->side_image3) : null,
                'price'           => $product->price,
                'description'     => $product->description,
                'sizes'           => $product->sizes,
                'average_rating'  => number_format($averageRating, 1),
            ],
            'reviews' => $product->reviews->map(function ($review) {
                $profileImage = $review->user->profile && $review->user->profile->profile_image
                    ? asset('storage/' . ltrim($review->user->profile->profile_image, '/'))
                    : asset('default-profile.png');
                return [
                    'rating' => $review->rating,
                    'review' => $review->review,
                    'user' => [
                        'username'      => $review->user->username ?? 'Anonymous',
                        'profile_image' => $profileImage,
                    ]
                ];
            })
        ]);
    }
}
