<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class RegisterController extends Controller
{
    // Method to handle user registration
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'username' => 'required|unique:users,username',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255', // Ensure nullable for middle name
            'last_name' => 'required|string|max:255',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        // Create user
        try {
            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name, // Optional field
                'last_name' => $request->last_name,
                'password' => Hash::make($request->password),
            ]);

            // Generate token
            $token = $user->createToken('MyApp')->accessToken;

            // Check if token was generated successfully
            if (!$token) {
                Log::error('Token generation failed for user ID: ' . $user->id);
                return response()->json(['error' => 'Token generation failed'], 500);
            }

            // Return success response with user data and token
            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            // Log detailed error message
            Log::error('Registration error: ' . $e->getMessage());

            return response()->json([
                'error' => 'An error occurred during registration. Please try again.',
                'details' => $e->getMessage(), // Show the error details for debugging
            ], 500);
        }
    }
}
