<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UsersController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Register Request Data:', $request->all()); // Log request data

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|confirmed',
        ]);

        if ($validator->fails()) {
            Log::error('Validation Errors:', $validator->errors()->toArray()); // Log validation errors
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Set a default role (optional: manually update in the database later)
        $role = Role::where('role_type', 'user')->first(); // Default to 'user' role

        // Ensure role exists
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        // Create user
        $user = User::create([
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role_id' => $role->id, // Assign default user role (modify manually later)
        ]);

        // Create profile
        $user->profile()->create([
            'first_name' => $request->first_name,
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

        // Attempt to authenticate
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();
            $user->load('role');  // Ensure the role is loaded

            $token = $user->createToken('YourAppName')->accessToken;

            return response()->json([
                'token' => $token,
                'user' => $user,  // Return user with role
                'role' => $user->role->role_type  // Send the role in the response
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function adminDashboard(Request $request)
    {
        $user = $request->user(); // Get the authenticated user

        if ($user->role->role_type !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403); // Deny access if not an admin
        }

        // Assuming you want to return some admin-specific data, replace this with your logic
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
        $token = $request->user()->token();
        $token->revoke(); // ✅ Revoke the token so the user is logged out

        return response()->json(['message' => 'Logged out successfully'], 200);
    }
}
