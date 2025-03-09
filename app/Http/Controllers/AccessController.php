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
            'username'          => 'required|unique:users',
            'email'             => 'required|email|unique:users',
            'first_name'        => 'required',
            'last_name'         => 'required',
            'password'          => 'required|confirmed',
            // Optional suffix field; adjust rules as needed
            'suffix'            => 'nullable|string',
        ]);

        // Assign role "user" (assume role_id "2" corresponds to user)
        $userRole = Role::firstOrCreate(['name' => 'user']);

        $user = User::create([
            'username' => $validatedData['username'],
            'email'    => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role_id'  => $userRole->id,
            'status'   => 'active',
        ]);

        // Create profile record including suffix
        Profile::create([
            'user_id'     => $user->id,
            'first_name'  => $validatedData['first_name'],
            'middle_name' => $request->input('middle_name'), // optional field
            'last_name'   => $validatedData['last_name'],
            'suffix'      => $validatedData['suffix'] ?? null,
        ]);

        // Registration complete: inform the client to redirect to login.
        return response()->json([
            'message' => 'Registration successful. Please log in.',
            'user'    => $user
        ], 201);
    }

    // Login endpoint remains largely unchanged
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

        // Prevent login if the user's status is inactive
        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account is inactive.'], 403);
        }

        // Load the role relation so that the user object includes role info
        $user->load('role');
        $token = $user->createToken('authToken')->accessToken;

        return response()->json([
            'token' => $token,
            'user'  => $user
        ], 200);
    }
}
