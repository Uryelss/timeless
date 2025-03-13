<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Profile;
use App\Models\Role;

class AccessController extends Controller
{
    // Registration endpoint for regular users
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'username'   => 'required|unique:users',
            'email'      => 'required|email|unique:users',
            'first_name' => 'required',
            'last_name'  => 'required',
            'password'   => 'required|confirmed',
            'suffix'     => 'nullable|string',
        ]);

        // Assign role "user"
        $userRole = Role::firstOrCreate(['name' => 'user']);

        $user = User::create([
            'username' => $validatedData['username'],
            'email'    => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role_id'  => $userRole->id,
            'status'   => 'active',
        ]);

        // Create profile record
        Profile::create([
            'user_id'     => $user->id,
            'first_name'  => $validatedData['first_name'],
            'middle_name' => $request->input('middle_name'),
            'last_name'   => $validatedData['last_name'],
            'suffix'      => $validatedData['suffix'] ?? null,
        ]);

        return response()->json([
            'message' => 'Registration successful. Please log in.',
            'user'    => $user
        ], 201);
    }

    // Login endpoint
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account is inactive.'], 403);
        }

        // Load role and profile relations
        $user->load('role', 'profile');
        $token = $user->createToken('authToken')->accessToken;

        return response()->json([
            'token' => $token,
            'user'  => $user
        ], 200);
    }

    // Logout endpoint
    public function logout(Request $request)
    {
        // Revoke the token (Laravel Passport)
        $request->user()->token()->revoke();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
