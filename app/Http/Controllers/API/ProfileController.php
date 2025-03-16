<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
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

        $response = $profile->toArray();
        $response['username'] = $user->username;
        if ($response['profile_image']) {
            $response['profile_image'] = asset('storage/' . $response['profile_image']);
        }
        return response()->json($response);
    }

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
                'gender'        => null,
                'date_of_birth' => null,
                'phone'         => '',
                'profile_image' => null,
                'address'       => ''
            ]
        );

        $validatedData = $request->validate([
            'username'      => 'nullable|string',
            'first_name'    => 'nullable|string',
            'middle_name'   => 'nullable|string',
            'last_name'     => 'nullable|string',
            'suffix'        => 'nullable|string',
            'gender'        => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'phone'         => 'nullable|string',
            'profile_image' => 'nullable|file|image',
            'address'       => 'nullable|string',
        ]);

        if (isset($validatedData['gender']) && trim($validatedData['gender']) === "") {
            $validatedData['gender'] = null;
        }

        if (isset($validatedData['username'])) {
            $user->username = $validatedData['username'];
            $user->save();
            unset($validatedData['username']);
        }

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profiles', 'public');
            $validatedData['profile_image'] = $path;
        }

        $profile->update(array_filter($validatedData, fn($value) => !is_null($value)));

        $response = $profile->toArray();
        $response['username'] = $user->username;
        if ($response['profile_image']) {
            $response['profile_image'] = asset('storage/' . $response['profile_image']);
        }
        return response()->json($response, 200);
    }
}