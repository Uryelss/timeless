<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory;

class InventoryController extends Controller
{
    // ✅ Get All Inventory Items
    public function index()
    {
        return response()->json(Inventory::all(), 200);
    }

    // ✅ Update Inventory (Stock Quantity)
    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);

        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $inventory->update([
            'stock_quantity' => $request->stock_quantity,
            'stock_status' => $request->stock_quantity > 0 ? 'In Stock' : 'Out of Stock',
        ]);

        return response()->json(['message' => 'Inventory updated successfully'], 200);
    }

    // ✅ Archive Inventory Item
    public function archive($id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->delete(); // Soft delete
        return response()->json(['message' => 'Inventory archived successfully'], 200);
    }

    // ✅ Restore Archived Inventory
    public function restore($id)
    {
        $inventory = Inventory::onlyTrashed()->findOrFail($id);
        $inventory->restore();
        return response()->json(['message' => 'Inventory restored successfully'], 200);
    }

    // ✅ Get Archived Inventory
    public function archivedItems()
    {
        return response()->json(Inventory::onlyTrashed()->get(), 200);
    }
}
