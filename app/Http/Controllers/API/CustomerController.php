<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;
use App\Models\Address;

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
                'username' => $profile->user ? $profile->user->username : null, // Check if user exists
                'email' => $profile->user ? $profile->user->email : null,       // Check if user exists
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
            'username' => $profile->user ? $profile->user->username : null, // Check if user exists
            'email' => $profile->user ? $profile->user->email : null,       // Check if user exists
            'first_name' => $profile->first_name,
            'middle_name' => $profile->middle_name,
            'last_name' => $profile->last_name,
            'suffix' => $profile->suffix,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'phone' => $address ? $address->phone : null,
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

        // Validate profile data
        $profileData = $request->validate([
            'first_name' => 'sometimes|required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'sometimes|required|string',
            'suffix' => 'nullable|string',
            'gender' => 'sometimes|nullable|string',
            'date_of_birth' => 'sometimes|nullable|date',
            'profile_image' => 'nullable|file|image',
        ]);

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profiles', 'public');
            $profileData['profile_image'] = asset('storage/' . $path);
        }

        // Update profile
        $profile->update($profileData);

        // Handle phone update in the addresses table
        if ($request->has('phone')) {
            $addressData = $request->validate([
                'phone' => 'sometimes|nullable|string|max:15', // Adjust max length as needed
            ]);

            $address = $profile->addresses()->where('is_default', 1)->first();
            if ($address) {
                $address->update(['phone' => $addressData['phone']]);
            } else {
                // Create a new address if none exists (minimal data for demo purposes)
                $profile->addresses()->create([
                    'phone' => $addressData['phone'],
                    'is_default' => 1,
                    'street' => $request->input('street', 'N/A'), // Add defaults or require these fields
                    'city' => $request->input('city', 'N/A'),
                    'state' => $request->input('state', 'N/A'),
                    'barangay' => $request->input('barangay', 'N/A'),
                    'postal_code' => $request->input('postal_code', '0000'),
                    'country' => $request->input('country', 'Philippines'),
                ]);
            }
        }

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
