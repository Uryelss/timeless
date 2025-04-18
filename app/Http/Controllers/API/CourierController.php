<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CourierController extends Controller
{
    public function index()
    {
        try {
            $couriers = Courier::all();
            return response()->json($couriers);
        } catch (\Exception $e) {
            Log::error("Failed to fetch couriers: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch couriers'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:couriers,email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'status' => 'required|string|in:active,inactive,on delivery,returned',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $request->all();
            $data['phone_number'] = $request->phone;
            $courier = Courier::create($data);
            return response()->json($courier, 201);
        } catch (\Exception $e) {
            Log::error("Failed to create courier: " . $e->getMessage());
            return response()->json(['error' => 'Failed to create courier'], 500);
        }
    }

    public function show($id)
    {
        try {
            $courier = Courier::findOrFail($id);
            return response()->json($courier);
        } catch (\Exception $e) {
            Log::error("Failed to fetch courier {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Courier not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $courier = Courier::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:couriers,email,' . $courier->id,
                'phone' => 'required|string|max:20',
                'address' => 'required|string',
                'status' => 'required|string|in:active,inactive,on delivery,returned',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $request->all();
            $data['phone_number'] = $request->phone;
            $courier->update($data);

            return response()->json($courier);
        } catch (\Exception $e) {
            Log::error("Failed to update courier {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to update courier'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $courier = Courier::findOrFail($id);
            $courier->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("Failed to delete courier {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete courier'], 500);
        }
    }

    public function transfer($id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->transfer_status = 'transferred';
            $order->save();
            return response()->json(['message' => 'Transfer status updated to transferred', 'order' => $order], 200);
        } catch (\Exception $e) {
            Log::error("Failed to update transfer status for order {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to update transfer status'], 500);
        }
    }
}
