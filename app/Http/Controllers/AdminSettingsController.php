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
    // ✅ Fetch all available filters
    public function index()
    {
        return response()->json([
            'brands' => Brand::orderBy('name')->get(),
            'categories' => Category::orderBy('name')->get(),
            'movements' => Movement::orderBy('name')->get(),
            'strapMaterials' => StrapMaterial::orderBy('name')->get(),
            'genders' => Gender::orderBy('name')->get(),
            'sizes' => Size::orderBy('name')->get(),

        ]);
    }

    // ✅ Add a new filter (brand, category, etc.)
    public function addFilter(Request $request, $type)
    {
        $request->validate(['name' => 'required|string|unique:brands,name']);

        Log::info("Adding new $type: " . $request->name);

        $model = $this->getModel($type);

        if ($model) {
            $filter = new $model();
            $filter->name = $request->name;
            $filter->save();

            return response()->json(['message' => ucfirst($type) . ' added successfully.'], 201);
        }

        return response()->json(['error' => 'Invalid filter type'], 400);
    }

    // ✅ Get the correct model for filter type
    private function getModel($type)
    {
        $models = [
            'brand' => Brand::class,
            'category' => Category::class,
            'movement' => Movement::class,
            'strap-material' => StrapMaterial::class,
            'gender' => Gender::class,
            'size' => Size::class,
        ];

        return $models[$type] ?? null;
    }
}
