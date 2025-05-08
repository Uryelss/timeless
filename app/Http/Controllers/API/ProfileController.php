<?php

// app/Http/Controllers/API/ProfileController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        return response()->json([
            'id' => $user->profile->id,
            'user_id' => $user->id,
            'username' => $user->username,
            'first_name' => $user->profile->first_name,
            'middle_name' => $user->profile->middle_name,
            'last_name' => $user->profile->last_name,
            'suffix' => $user->profile->suffix,
            'date_of_birth' => $user->profile->date_of_birth,
            'gender' => $user->profile->gender,
            'email' => $user->email,
            'profile_image' => $user->profile->profile_image
                ? Storage::url($user->profile->profile_image)
                : null,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255', 'unique:users,username,' . $user->id],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:Male,Female'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'profile_image' => ['nullable', 'file', 'image', 'max:2048'],
        ]);

        $user->update([
            'username' => $validated['username'],
            'email' => $validated['email'],
        ]);

        $profileData = [
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix' => $validated['suffix'],
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
        ];

        if ($request->hasFile('profile_image')) {
            if ($user->profile->profile_image) {
                Storage::delete($user->profile->profile_image);
            }
            $path = $request->file('profile_image')->store('profiles', 'public');
            $profileData['profile_image'] = $path;
        }

        $user->profile->update($profileData);

        return response()->json([
            'id' => $user->profile->id,
            'user_id' => $user->id,
            'username' => $user->username,
            'first_name' => $user->profile->first_name,
            'middle_name' => $user->profile->middle_name,
            'last_name' => $user->profile->last_name,
            'suffix' => $user->profile->suffix,
            'date_of_birth' => $user->profile->date_of_birth,
            'gender' => $user->profile->gender,
            'email' => $user->email,
            'profile_image' => $user->profile->profile_image
                ? Storage::url($user->profile->profile_image)
                : null,
        ]);
    }
}
