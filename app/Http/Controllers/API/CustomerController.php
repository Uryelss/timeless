<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;

class CustomerController extends Controller
{
    // List all customer profiles with their related user data
    public function index(Request $request)
    {
        $customers = Profile::with('user')->get();
        return response()->json($customers);
    }

    // Get a single customer profile by profile ID
    public function show($id)
    {
        $profile = Profile::with('user')->findOrFail($id);
        $mergedData = [
            'id'            => $profile->id,
            'user_id'       => $profile->user_id,
            'username'      => $profile->user->username,
            'email'         => $profile->user->email,
            'first_name'    => $profile->first_name,
            'middle_name'   => $profile->middle_name,
            'last_name'     => $profile->last_name,
            'suffix'        => $profile->suffix,
            'gender'        => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'phone'         => $profile->phone,
            'profile_image' => $profile->profile_image,
            'created_at'    => $profile->created_at,
            'updated_at'    => $profile->updated_at,
        ];
        return response()->json($mergedData);
    }

    // Update a customer profile by profile ID
    public function update(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);

        $validatedData = $request->validate([
            'first_name'    => 'sometimes|required|string',
            'middle_name'   => 'nullable|string',
            'last_name'     => 'sometimes|required|string',
            'suffix'        => 'nullable|string',
            'gender'        => 'sometimes|nullable|string',
            'date_of_birth' => 'sometimes|nullable|date',
            'phone'         => 'sometimes|nullable|string',
            'profile_image' => 'nullable|file|image',
            'address'       => 'sometimes|nullable|string',
        ]);

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profiles', 'public');
            // Return a full URL for the image so it can be displayed on the frontend
            $validatedData['profile_image'] = asset('storage/' . $path);
        }

        $profile->update($validatedData);
        return response()->json($profile);
    }

    // Archive (soft delete) a customer profile by profile ID
    public function destroy($id)
    {
        $profile = Profile::findOrFail($id);
        $profile->delete();
        return response()->json(['message' => 'Customer archived successfully']);
    }

    // Restore a soft-deleted customer profile by profile ID
    public function restore($id)
    {
        $profile = Profile::withTrashed()->findOrFail($id);
        $profile->restore();
        return response()->json(['message' => 'Customer restored successfully']);
    }
    public function profile(Request $request)
    {
        // This assumes the user is authenticated and their profile exists
        $profile = Profile::where('user_id', $request->user()->id)->first();
        return response()->json($profile);
    }
}