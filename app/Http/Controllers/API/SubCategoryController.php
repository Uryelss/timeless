<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubCategory;

class SubCategoryController extends Controller
{
    // Public endpoint to fetch sub-categories by type
    public function publicIndex(Request $request)
    {
        $type = $request->get('type');
        $data = SubCategory::where('type', $type)->get();
        return response()->json($data);
    }

    // Admin endpoint: list sub-categories (active or archived) based on query parameter.
    public function index(Request $request)
    {
        $type = $request->get('type');
        if ($request->has('archived') && $request->get('archived') == 1) {
            $data = SubCategory::onlyTrashed()->where('type', $type)->get();
        } else {
            $data = SubCategory::where('type', $type)->get();
        }
        return response()->json($data);
    }

    // Store a new sub-category record
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'type' => 'required|string',
            'name' => 'required|string',
        ]);

        $subCategory = SubCategory::create($validatedData);
        return response()->json($subCategory, 201);
    }

    // Update an existing sub-category record
    public function update(Request $request, $id)
    {
        $subCategory = SubCategory::findOrFail($id);
        $validatedData = $request->validate([
            'name' => 'required|string',
        ]);
        $subCategory->update($validatedData);
        return response()->json($subCategory);
    }

    // Archive (soft delete) a sub-category record
    public function destroy($id)
    {
        $subCategory = SubCategory::findOrFail($id);
        $subCategory->delete();
        return response()->json(['message' => 'SubCategory archived successfully']);
    }

    // Restore an archived sub-category record
    public function restore($id)
    {
        $subCategory = SubCategory::withTrashed()->findOrFail($id);
        $subCategory->restore();
        return response()->json(['message' => 'SubCategory restored successfully']);
    }
}
