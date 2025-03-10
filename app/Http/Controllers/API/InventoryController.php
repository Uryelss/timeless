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
            $inventory = Inventory::onlyTrashed()->with('product')->get();
        } else {
            if ($request->has('product_id')) {
                $inventory = Inventory::where('product_id', $request->product_id)
                    ->with('product')
                    ->get();
            } else {
                $inventory = Inventory::with('product')->get();
            }
        }
        return response()->json($inventory);
    }



    // Store, update, destroy, restore methods remain as before...
    public function store(Request $request, $product_id)
    {
        $validatedData = $request->validate([
            'size' => 'required|string',
            'quantity' => 'required|integer',
        ]);

        // Find the product and fetch sizes from it
        $product = Product::findOrFail($product_id);

        // Store inventory data
        $inventory = Inventory::create([
            'product_id' => $product_id,
            'size' => $validatedData['size'],
            'quantity' => $validatedData['quantity'],
            'sold' => 0,
            'stock_status' => $validatedData['quantity'] == 0 ? 'Out of Stock' : 'In Stock',
        ]);

        return response()->json($inventory, 201);
    }

    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);

        $validatedData = $request->validate([
            'size' => 'sometimes|required|string',
            'quantity' => 'sometimes|required|integer',
            'sold' => 'sometimes|required|integer',
        ]);

        $inventory->update($validatedData);

        // Update stock status based on quantity
        if ($inventory->quantity == 0) {
            $inventory->stock_status = 'Out of Stock';
        } elseif ($inventory->quantity < 10) {
            $inventory->stock_status = 'Low Stock';
        } else {
            $inventory->stock_status = 'In Stock';
        }
        $inventory->save();

        return response()->json($inventory);
    }

    public function destroy($id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->delete();
        return response()->json(['message' => 'Inventory archived successfully']);
    }

    public function restore($id)
    {
        $inventory = Inventory::withTrashed()->findOrFail($id);
        $inventory->restore();
        return response()->json(['message' => 'Inventory restored successfully']);
    }
}