<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            'is_pickup' => 'sometimes|boolean', // Optional, defaults to false
            'is_return' => 'sometimes|boolean', // Optional, defaults to false
        ]);

        $address = Address::create(array_merge($validated, [
            'profile_id' => $user->profile->id,
            'is_pickup' => $request->input('is_pickup', false),
            'is_return' => $request->input('is_return', false),
        ]));

        return response()->json($address, 201);
    }

    public function update(Request $request, $id)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->profile) {
            return response()->json(['message' => 'No profile found for this user'], 404);
        }

        $address = Address::where('profile_id', $user->profile->id)->findOrFail($id);

        $validated = $request->validate([
            'street' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'country' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'is_pickup' => 'sometimes|boolean',
            'is_return' => 'sometimes|boolean',
        ]);

        try {
            $address->update(array_merge($validated, [
                'is_pickup' => $request->input('is_pickup', $address->is_pickup),
                'is_return' => $request->input('is_return', $address->is_return),
            ]));
            return response()->json($address);
        } catch (\Exception $e) {
            Log::error('Address Update Error', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating address'], 500);
        }
    }

    public function setDefault(Request $request, $id)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->profile) {
            return response()->json(['message' => 'No profile found for this user'], 404);
        }

        $address = Address::where('profile_id', $user->profile->id)->findOrFail($id);

        try {
            // Unset current default address for this user's profile
            Address::where('profile_id', $user->profile->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            // Set the selected address as default
            $address->update(['is_default' => true]);

            return response()->json(['message' => 'Address set as default successfully', 'address' => $address]);
        } catch (\Exception $e) {
            Log::error('Set Default Address Error', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Error setting default address'], 500);
        }
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->profile) {
            return response()->json(['message' => 'No profile found for this user'], 404);
        }

        $address = Address::where('profile_id', $user->profile->id)->findOrFail($id);

        try {
            $address->delete();
            return response()->json(['message' => 'Address deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Address Delete Error', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Error deleting address'], 500);
        }
    }
}