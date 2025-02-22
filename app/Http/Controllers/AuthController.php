<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Profile;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // REGISTER FUNCTION
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'suffix' => 'nullable|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Assign role
        $isAdmin = strpos(strtolower($request->email), '@admin.com') !== false;
        $role = Role::where('role_name', $isAdmin ? 'admin' : 'user')->first();

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 500);
        }

        // Create user
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),  // Ensure password is hashed
            'role_id' => $role->id,
        ]);

        // Create user profile
        Profile::create([
            'user_id' => $user->id,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
        ]);

        // Generate authentication token (Laravel 7 Passport)
        $token = $user->createToken('AuthToken')->accessToken;

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user,
            'token' => $token,
        ], 201);
    }


    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Retrieve the user by email
        $user = User::with('role')->where('email', $request->email)->first();

        // If user not found, return error
        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check if password matches
        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Get the role from the user
        $roleName = $user->role ? $user->role->role_name : 'user'; // Default to 'user' if no role

        // Generate authentication token (Laravel Passport)
        $token = $user->createToken('AuthToken')->accessToken;

        // Return user data and token
        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $roleName  // Return role to frontend
            ],
            'token' => $token
        ]);
    }
}
