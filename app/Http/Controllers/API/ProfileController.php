<?php

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

        // Ensure profile exists, create if missing
        if (!$user->profile) {
            $user->profile()->create([
                'first_name' => '',
                'last_name' => '',
                'middle_name' => null,
                'suffix' => null,
                'date_of_birth' => null,
                'gender' => null,
            ]);
        }

        $response = response()->json([
            'id' => $user->profile->id ?? null,
            'user_id' => $user->id,
            'username' => $user->username ?? '',
            'first_name' => $user->profile->first_name ?? '',
            'middle_name' => $user->profile->middle_name ?? null,
            'last_name' => $user->profile->last_name ?? '',
            'suffix' => $user->profile->suffix ?? null,
            'date_of_birth' => $user->profile->date_of_birth ?? null,
            'gender' => $user->profile->gender ?? null,
            'email' => $user->email ?? null,
            'profile_image' => $user->profile->profile_image
                ? Storage::url($user->profile->profile_image)
                : null,
        ]);

        return $response->header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $user->id . ',id'],
            'profile_image' => ['nullable', 'file', 'image', 'max:2048'],
        ]);

        $user->update([
            'username' => $validated['username'],
            'email' => $validated['email'] ?? $user->email,
        ]);

        // Ensure profile exists
        if (!$user->profile) {
            $user->profile()->create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
            ]);
        }

        $profileData = [
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'suffix' => $validated['suffix'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'gender' => $validated['gender'] ?? null,
        ];

        if ($request->hasFile('profile_image')) {
            if ($user->profile->profile_image) {
                Storage::delete($user->profile->profile_image);
            }
            $path = $request->file('profile_image')->store('profiles', 'public');
            $profileData['profile_image'] = $path;
        }

        $user->profile->update($profileData);

        $response = response()->json([
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

        return $response->header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
}