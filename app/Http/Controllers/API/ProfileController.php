<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    // Get the authenticated user's profile including the username
    public function show()
    {
        $user = Auth::user();
        $profile = Profile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'first_name'    => '',
                'middle_name'   => '',
                'last_name'     => '',
                'suffix'        => '',
                'gender'        => null,
                'date_of_birth' => null,
                'phone'         => '',
                'profile_image' => null,
                'address'       => ''
            ]
        );
        // Load the addresses relation so that CheckoutPage can see them
        $profile->load('addresses');

        $response = $profile->toArray();
        $response['username'] = $user->username;
        return response()->json($response);
    }


    // Update the authenticated user's profile
    public function update(Request $request)
    {
        $user = Auth::user();
        $profile = Profile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'first_name'    => '',
                'middle_name'   => '',
                'last_name'     => '',
                'suffix'        => '',
                'gender'        => null,  // Use null as default
                'date_of_birth' => null,
                'phone'         => '',
                'profile_image' => null,
                'address'       => ''
            ]
        );

        $validatedData = $request->validate([
            'username'      => 'sometimes|required|string',
            'first_name'    => 'sometimes|required|string',
            'middle_name'   => 'nullable|string',
            'last_name'     => 'sometimes|required|string',
            'suffix'        => 'nullable|string',
            'gender'        => 'nullable|string', // Allow null
            'date_of_birth' => 'nullable|date',
            'phone'         => 'nullable|string',
            'profile_image' => 'nullable|file|image',
            'address'       => 'nullable|string',
        ]);

        // Convert gender to null if it's empty
        if (isset($validatedData['gender']) && trim($validatedData['gender']) === "") {
            $validatedData['gender'] = null;
        }

        if (isset($validatedData['username'])) {
            $user->username = $validatedData['username'];
            $user->save();
        }

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profiles', 'public');
            $validatedData['profile_image'] = asset('storage/' . $path);
        }

        unset($validatedData['username']);

        $profile->update($validatedData);

        $response = $profile->toArray();
        $response['username'] = $user->username;
        return response()->json($response);
    }
}
