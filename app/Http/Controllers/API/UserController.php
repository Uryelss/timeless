<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // List active users or archived if query param is set
    public function index(Request $request)
    {
        if ($request->query('archived')) {
            $users = User::onlyTrashed()->with('role')->get();
        } else {
            $users = User::with('role')->get();
        }
        return response()->json($users);
    }

    // Store a new user
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'username' => 'required|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|integer',
            'status' => 'required|string',
        ]);

        $user = User::create([
            'username' => $validatedData['username'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role_id' => $validatedData['role_id'],
            'status' => $validatedData['status'],
        ]);

        return response()->json($user, 201);
    }

    // Update an existing user
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validatedData = $request->validate([
            'username' => 'sometimes|required|unique:users,username,' . $user->id,
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role_id' => 'sometimes|required|integer',
            'status' => 'sometimes|required|string',
        ]);

        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']);
        }

        $user->update($validatedData);
        return response()->json($user);
    }

    // Archive (soft delete) a user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'inactive']);
        $user->delete();
        return response()->json(['message' => 'User archived successfully and set to inactive']);
    }

    // Restore a soft-deleted user
    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();
        return response()->json(['message' => 'User restored successfully']);
    }

    // Fetch the authenticated user's details
    public function getCurrentUser(Request $request)
    {
        Log::info("Attempting to fetch current user", ['token' => $request->bearerToken()]);
        try {
            $user = Auth::user();
            if (!$user) {
                Log::warning("No authenticated user found");
                return response()->json(['message' => 'User not authenticated'], 401);
            }
            Log::info("User found", ['username' => $user->username]);
            return response()->json(['username' => $user->username]);
        } catch (\Exception $e) {
            Log::error("Error in getCurrentUser", [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }
}