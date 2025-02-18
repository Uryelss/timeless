<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Register a new user
    public function register(Request $request)
    {
        // Validate the input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'username' => 'required|unique:users,username',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255', // Allow null for middle_name
            'last_name' => 'required|string|max:255',
            'password' => 'required|min:8|confirmed', // Ensuring the passwords match
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create the user record
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'password' => Hash::make($request->password), // Encrypt the password
        ]);

        // Generate access token
        $token = $user->createToken('MyApp')->accessToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token, // Sending the token back to the client
        ], 201);
    }

    // Login user and return access token
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (auth()->attempt($credentials)) {
            $user = auth()->user();
            $token = $user->createToken('MyApp')->accessToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
            ]);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }
}
