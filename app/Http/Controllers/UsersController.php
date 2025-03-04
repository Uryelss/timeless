<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class UsersController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Register Request Data:', $request->all());

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|confirmed',
        ]);

        if ($validator->fails()) {
            Log::error('Validation Errors:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $role = Role::where('role_type', 'user')->first();

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $user = User::create([
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
        ]);

        $user->profile()->create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name ?? null, // ✅ Add middle name
            'last_name' => $request->last_name,
            'suffix' => $request->suffix ?? null,
            'gender' => $request->gender ?? null,
            'date_of_birth' => $request->date_of_birth ?? null,
            'phone' => $request->phone ?? null,
        ]);

        return response()->json(['message' => 'Registration successful'], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();
            $user->load('role');

            $token = $user->createToken('YourAppName')->accessToken;

            return response()->json([
                'token' => $token,
                'user' => $user,
                'role' => $user->role->role_type
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function adminDashboard(Request $request)
    {
        $user = $request->user();

        if ($user->role->role_type !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'message' => 'Welcome to the admin dashboard',
            'adminData' => [
                'user_count' => 100,
                'pending_requests' => 5,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->token()->revoke();
        }

        return response()->json(['message' => 'Logged out successfully'], 200);
    }
    public function getUserProfile()
    {
        $user = User::with('profile')->find(Auth::id()); // ✅ Load user & profile

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // ✅ Ensure profile exists, otherwise create a default empty one
        if (!$user->profile) {
            $user->profile()->create([]);
        }

        $profile = $user->profile; // ✅ Profile is now always present

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'first_name' => $profile->first_name ?? '', // ✅ Prevent NULL issues
            'middle_name' => $profile->middle_name ?? '',
            'last_name' => $profile->last_name ?? '',
            'suffix' => $profile->suffix ?? '',
            'date_of_birth' => $profile->date_of_birth ?? '',
            'gender' => $profile->gender ?? '',
            'profile_image' => $profile->profile_image
                ? asset('storage/' . $profile->profile_image)  // ✅ Fix image URL
                : asset('/default-profile.png'),  // ✅ Default fallback
        ], 200);
    }


    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        // ✅ Define validation rules
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // ✅ Update User Basic Info
        $user->update([
            'username' => $request->username,
            'email' => $request->email,
        ]);

        // ✅ Update Profile Details
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
            ]
        );

        // ✅ Handle Profile Image Upload
        if ($request->hasFile('profile_image')) {
            $profile = $user->profile;

            // ✅ Delete old profile image if exists
            if ($profile->profile_image) {
                Storage::delete('public/' . $profile->profile_image);
            }

            // ✅ Store new image
            $imagePath = $request->file('profile_image')->store('profile_images', 'public');
            $profile->update(['profile_image' => $imagePath]);
        }


        return response()->json(['message' => 'Profile updated successfully!', 'user' => $user->load('profile')], 200);
    }
}
