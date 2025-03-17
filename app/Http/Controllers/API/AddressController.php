<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->profile) {
            return response()->json(['message' => 'No profile found for this user'], 404);
        }

        $addresses = Address::with('profile')
            ->where('profile_id', $user->profile->id)
            ->get();

        return response()->json($addresses);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->profile) {
            return response()->json(['message' => 'No profile found for this user'], 404);
        }

        $validated = $request->validate([
            'street' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'country' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        $address = Address::create(array_merge($validated, ['profile_id' => $user->profile->id]));
        return response()->json($address, 201);
    }

    // Add destroy and setDefault methods as needed
}