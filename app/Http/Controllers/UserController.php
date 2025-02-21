<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log; // ✅ ADD THIS LINE

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        $users = User::join('roles', 'users.role_id', '=', 'roles.id')
            ->select('users.id', 'users.username', 'users.email', 'roles.role_name as role', 'users.created_at', 'users.updated_at')
            ->get();

        return response()->json($users);
    }


    // Store new user
    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id', // Ensure role exists
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id, // Store role as an ID
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user]);
    }

    // Update user
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        try {
            Log::info('Update Request Data:', $request->all()); // Log request data

            $validated = $request->validate([
                'username' => 'required|string|max:255|unique:users,username,' . $id,
                'email' => 'required|email|unique:users,email,' . $id,
                'role_id' => 'required|exists:roles,id',
                'password' => 'nullable|string|min:6',
            ]);

            $user->username = $validated['username'];
            $user->email = $validated['email'];
            $user->role_id = $validated['role_id'];

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();
            return response()->json(['message' => 'User updated successfully', 'user' => $user]);
        } catch (\Exception $e) {
            Log::error('User update failed: ' . $e->getMessage()); // Log error
            return response()->json(['error' => 'Failed to update user', 'message' => $e->getMessage()], 500);
        }
    }

    // Archive (soft delete)
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        $user->delete();
        return response()->json(['message' => 'User archived successfully']);
    }
}
