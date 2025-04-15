<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CourierController extends Controller
{
    public function index()
    {
        $couriers = Courier::all();
        return response()->json($couriers);
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

        $data = $request->all();
        $data['phone_number'] = $request->phone;

        $courier = Courier::create($data);

        return response()->json($courier, 201);
    }

    public function show($id)
    {
        $courier = Courier::findOrFail($id);
        return response()->json($courier);
    }

    public function update(Request $request, $id)
    {
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
    }

    public function destroy($id)
    {
        $courier = Courier::findOrFail($id);
        $courier->delete();

        return response()->json(null, 204);
    }
}