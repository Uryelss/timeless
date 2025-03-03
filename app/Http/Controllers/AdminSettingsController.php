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
    // ✅ Fetch all available filters including archived (if requested)
    public function index(Request $request)
    {
        $archived = $request->query('archived') == 'true';

        return response()->json([
            'brands' => Brand::when($archived, fn($query) => $query->onlyTrashed())->orderBy('name')->get(),
            'categories' => Category::when($archived, fn($query) => $query->onlyTrashed())->orderBy('name')->get(),
            'movements' => Movement::when($archived, fn($query) => $query->onlyTrashed())->orderBy('name')->get(),
            'strapMaterials' => StrapMaterial::when($archived, fn($query) => $query->onlyTrashed())->orderBy('name')->get(),
            'genders' => Gender::when($archived, fn($query) => $query->onlyTrashed())->orderBy('name')->get(),
            'sizes' => Size::when($archived, fn($query) => $query->onlyTrashed())->orderBy('name')->get(),
        ]);
    }

    // ✅ Add a new filter (brand, category, etc.)
    public function addFilter(Request $request, $type)
    {
        $request->validate(['name' => 'required|string']);

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

    // ✅ Update an existing filter
    public function updateFilter(Request $request, $type, $id)
    {
        $request->validate(['name' => 'required|string']);

        $model = $this->getModel($type);

        if ($model) {
            $filter = $model::findOrFail($id);
            $filter->update(['name' => $request->name]);

            return response()->json(['message' => ucfirst($type) . ' updated successfully.'], 200);
        }

        return response()->json(['error' => 'Invalid filter type'], 400);
    }

    // ✅ Archive (soft delete) a filter
    public function archiveFilter($type, $id)
    {
        $model = $this->getModel($type);

        if ($model) {
            $filter = $model::findOrFail($id);
            $filter->delete();

            return response()->json(['message' => ucfirst($type) . ' archived successfully.'], 200);
        }

        return response()->json(['error' => 'Invalid filter type'], 400);
    }

    // ✅ Restore an archived filter
    public function restoreFilter($type, $id)
    {
        $model = $this->getModel($type);

        if ($model) {
            $filter = $model::onlyTrashed()->findOrFail($id);
            $filter->restore();

            return response()->json(['message' => ucfirst($type) . ' restored successfully.'], 200);
        }

        return response()->json(['error' => 'Invalid filter type'], 400);
    }

    // ✅ Get the correct model for filter type
    private function getModel($type)
    {
        $models = [
            'brands' => Brand::class,
            'categories' => Category::class,
            'movements' => Movement::class,
            'strapMaterials' => StrapMaterial::class,
            'genders' => Gender::class,
            'sizes' => Size::class,
        ];

        return $models[$type] ?? null;
    }
}
