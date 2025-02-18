<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Passport\PersonalAccessTokenResult;

class UserController extends Controller
{
    // Register User
    public function register(Request $request)
    {
        // Validate inputs
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Ensure password confirmation is valid
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 400);
        }

        // Create the new user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Generate API token for the user
        $token = $user->createToken('ecommerce-app')->accessToken;

        // Return success response with user data and token
        return response()->json([
            'status' => 'success',
            'message' => 'Registration successful',
            'user' => $user->makeHidden(['password']), // Hide sensitive data
            'token' => $token,
        ], 201);
    }

    // Login User
    public function login(Request $request)
    {
        // Validate inputs
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 400);
        }

        // Check if the user exists
        $user = User::where('email', $request->email)->first();

        // If the user does not exist or password is incorrect, return an error
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Generate API token for the user
        $token = $user->createToken('ecommerce-app')->accessToken;

        // Return success response with user data and token
        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => $user->makeHidden(['password']), // Hide sensitive data
            'token' => $token,
        ], 200);
    }

    // Get User Information (For Dashboard)
    public function user(Request $request)
    {
        // Fetch authenticated user
        $user = $request->user();

        // Return the user's data, excluding sensitive information
        return response()->json([
            'status' => 'success',
            'user' => $user->makeHidden(['password']),
        ], 200);
    }
}
