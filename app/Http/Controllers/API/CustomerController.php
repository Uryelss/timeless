<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Profile::with(['user', 'addresses']);
        if ($request->query('archived')) {
            $query->onlyTrashed();
        }
        $customers = $query->get();

        $customers = $customers->map(function ($profile) {
            $address = $profile->addresses->first(); // Use the first address for now
            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'username' => $profile->user->username,
                'email' => $profile->user->email,
                'first_name' => $profile->first_name,
                'middle_name' => $profile->middle_name,
                'last_name' => $profile->last_name,
                'suffix' => $profile->suffix,
                'gender' => $profile->gender,
                'date_of_birth' => $profile->date_of_birth,
                'phone' => $address ? $address->phone : null, // Fetch from address
                'profile_image' => $profile->profile_image,
                'address' => $address ? "{$address->street}, {$address->city}, {$address->state} {$address->postal_code}, {$address->country}" : null,
                'created_at' => $profile->created_at,
                'updated_at' => $profile->updated_at,
                'deleted_at' => $profile->deleted_at,
            ];
        });

        return response()->json($customers);
    }
    public function show($id)
    {
        $profile = Profile::with(['user', 'addresses'])->findOrFail($id);
        $address = $profile->addresses->first();
        $mergedData = [
            'id' => $profile->id,
            'user_id' => $profile->user_id,
            'username' => $profile->user->username,
            'email' => $profile->user->email,
            'first_name' => $profile->first_name,
            'middle_name' => $profile->middle_name,
            'last_name' => $profile->last_name,
            'suffix' => $profile->suffix,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'phone' => $profile->phone,
            'profile_image' => $profile->profile_image,
            'address' => $address ? "{$address->street}, {$address->city}, {$address->state} {$address->postal_code}, {$address->country}" : null,
            'created_at' => $profile->created_at,
            'updated_at' => $profile->updated_at,
            'deleted_at' => $profile->deleted_at,
        ];
        return response()->json($mergedData);
    }

    public function update(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);

        $validatedData = $request->validate([
            'first_name' => 'sometimes|required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'sometimes|required|string',
            'suffix' => 'nullable|string',
            'gender' => 'sometimes|nullable|string',
            'date_of_birth' => 'sometimes|nullable|date',
            'phone' => 'sometimes|nullable|string',
            'profile_image' => 'nullable|file|image',
            'address' => 'sometimes|nullable|string', // Not used here; address updates happen via checkout
        ]);

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profiles', 'public');
            $validatedData['profile_image'] = asset('storage/' . $path);
        }

        $profile->update($validatedData);
        return response()->json($profile->fresh(['user', 'addresses']));
    }

    public function destroy($id)
    {
        $profile = Profile::findOrFail($id);
        $profile->delete();
        return response()->json(['message' => 'Customer archived successfully']);
    }

    public function restore($id)
    {
        $profile = Profile::withTrashed()->findOrFail($id);
        $profile->restore();
        return response()->json(['message' => 'Customer restored successfully']);
    }

    public function profile(Request $request)
    {
        $profile = Profile::with('addresses')->where('user_id', $request->user()->id)->first();
        return response()->json($profile);
    }
}
