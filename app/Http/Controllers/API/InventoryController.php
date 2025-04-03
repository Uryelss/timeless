<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\Product;

class InventoryController extends Controller
{
    // List inventory records. Optionally, filter by product_id via query parameter.
    public function index(Request $request)
    {
        if ($request->query('archived')) {
            $inventory = Inventory::onlyTrashed()->with('product')->paginate(10);
        } else {
            if ($request->has('product_id')) {
                $request->validate(['product_id' => 'required|integer|exists:products,id']);
                $inventory = Inventory::where('product_id', $request->product_id)
                    ->with('product')
                    ->paginate(10);
            } else {
                $inventory = Inventory::with('product')->paginate(10);
            }
        }
        return response()->json($inventory);
    }

    // Fetch inventory for public use (used by frontend to get inventory_id)
    public function getPublicInventory(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'size' => 'required|string',
        ]);

        $inventory = Inventory::where('product_id', $request->query('product_id'))
            ->where('size', $request->query('size'))
            ->get();

        return response()->json($inventory);
    }

    // Store a new inventory record
    public function store(Request $request, $product_id)
    {
        $request->validate([
            'size' => 'required|string',
            'quantity' => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($product_id);

        // Check for existing inventory to prevent duplicates
        $existing = Inventory::where('product_id', $product_id)
            ->where('size', $request->size)
            ->first();
        if ($existing) {
            return response()->json(['message' => 'Inventory for this size already exists'], 422);
        }

        $inventory = Inventory::create([
            'product_id' => $product_id,
            'size' => $request->size,
            'quantity' => $request->quantity,
            'sold' => 0,
            'stock_status' => $request->quantity == 0 ? 'Out of Stock' : ($request->quantity < 10 ? 'Low Stock' : 'In Stock'),
        ]);

        return response()->json($inventory, 201);
    }

    // Update an existing inventory record
    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);

        $request->validate([
            'size' => 'sometimes|required|string',
            'quantity' => 'sometimes|required|integer|min:0',
            'sold' => 'sometimes|required|integer|min:0',
        ]);

        $inventory->fill($request->all());

        // Update stock status based on quantity
        $inventory->stock_status = $inventory->quantity == 0
            ? 'Out of Stock'
            : ($inventory->quantity < 10 ? 'Low Stock' : 'In Stock');

        $inventory->save();

        return response()->json($inventory);
    }

    // Soft-delete an inventory record
    public function destroy($id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->delete();
        return response()->json(['message' => 'Inventory archived successfully']);
    }

    // Restore a soft-deleted inventory record
    public function restore($id)
    {
        $inventory = Inventory::withTrashed()->findOrFail($id);
        $inventory->restore();
        return response()->json(['message' => 'Inventory restored successfully']);
    }
}
