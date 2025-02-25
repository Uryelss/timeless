<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Movement;
use App\Models\StrapMaterial;
use App\Models\Gender;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminSettingsController extends Controller
{
    // Get all filters (brands, categories, etc.)
    public function index()
    {
        $brands = Brand::all();
        $categories = Category::all();
        $movements = Movement::all();
        $strapMaterials = StrapMaterial::all();
        $genders = Gender::all();
        $sizes = Size::all();

        return response()->json([
            'brands' => $brands,
            'categories' => $categories,
            'movements' => $movements,
            'strap_materials' => $strapMaterials,
            'genders' => $genders,
            'sizes' => $sizes,
        ]);
    }

    // Add a new filter (brand, category, etc.)
    public function addFilter(Request $request, $type)
    {
        $request->validate(['name' => 'required|string']);

        // Log the request data to ensure it's being passed correctly
        Log::info($request->all());

        $model = $this->getModel($type);

        if ($model) {
            $filter = new $model();
            $filter->name = $request->name;
            $filter->save();

            return response()->json(['message' => ucfirst($type) . ' added successfully.']);
        }

        return response()->json(['error' => 'Invalid filter type'], 400);
    }

    // Return the model for each filter type
    private function getModel($type)
    {
        switch ($type) {
            case 'brand':
                return Brand::class;
            case 'category':
                return Category::class;
            case 'movement':
                return Movement::class;
            case 'strap-material':
                return StrapMaterial::class;
            case 'gender':
                return Gender::class;
            case 'size':
                return Size::class;
            default:
                return null;
        }
    }
}
