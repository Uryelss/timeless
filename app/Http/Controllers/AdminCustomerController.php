<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class AdminCustomerController extends Controller
{
    // ✅ Get Customers (Including Archived)
    public function index(Request $request)
    {
        $archived = $request->query('archived') == 'true';

        $customers = User::with(['profile', 'addresses'])
            ->when($archived, fn($query) => $query->onlyTrashed()) // Get archived users if true
            ->get()
            ->map(function ($user) {
                $profile = $user->profile ?? new Profile(); // ✅ Ensure profile exists

                return [
                    'id' => $user->id,
                    'full_name' => trim(implode(' ', array_filter([
                        $profile->first_name ?? '',
                        $profile->middle_name ?? '',
                        $profile->last_name ?? '',
                    ]))),

                    'phone' => $profile->phone ?? null,
                    'date_of_birth' => $profile->date_of_birth ?? null,
                    'gender' => $profile->gender ?? null,

                    // ✅ FIX PROFILE IMAGE PATH
                    'profile_image' => !empty($profile->profile_image)
                        ? asset('storage/' . $profile->profile_image)
                        : asset('default-profile.png'),

                    'address' => optional($user->addresses->where('is_default', true)->first())->full_address ?? 'No Address',
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json($customers, 200);
    }



    // ✅ Archive Customer
    public function archive($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Customer archived successfully'], 200);
    }

    // ✅ Restore Customer
    public function restore($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();
        return response()->json(['message' => 'Customer restored successfully'], 200);
    }
    public function show($id)
    {
        $customer = User::with(['profile', 'addresses'])
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'id' => $customer->id,
            'first_name' => $customer->profile->first_name ?? '',
            'last_name' => $customer->profile->last_name ?? '',
            'phone' => $customer->profile->phone ?? '',
            'date_of_birth' => $customer->profile->date_of_birth ?? '',
            'gender' => $customer->profile->gender ?? '',
            'profile_image' => $customer->profile->profile_image
                ? asset('storage/' . $customer->profile->profile_image)
                : asset('default-profile.png'),
            'address' => optional($customer->addresses->where('is_default', true)->first())->full_address ?? 'No Address',
            'updated_at' => $customer->updated_at->format('Y-m-d H:i:s'),
        ], 200);
    }
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $profile = Profile::where('user_id', $id)->first();

        // ✅ If the user doesn't have a profile, create one
        if (!$profile) {
            $profile = Profile::create(['user_id' => $id]);
        }

        // ✅ Allow optional fields (NULL values allowed)
        $validatedData = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // ✅ LOG the data being received for debugging
        Log::info('Updating Profile:', $validatedData);

        // ✅ Ensure null values are preserved instead of being ignored
        $profile->update(array_replace($profile->toArray(), $validatedData));

        // ✅ Handle profile image upload
        if ($request->hasFile('profile_image')) {
            $imagePath = $request->file('profile_image')->store('profile_images', 'public');
            $profile->update(['profile_image' => $imagePath]);
            Log::info("Profile image updated: " . $imagePath); // ✅ Log image path
        }

        return response()->json(['message' => 'Customer updated successfully'], 200);
    }
}
