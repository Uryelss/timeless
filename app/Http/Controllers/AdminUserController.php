<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    // ✅ Get All Users (Including Archived)
    public function index()
    {
        $users = User::whereNull('deleted_at') // ✅ Get only active users
            ->with('role')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role->role_type ?? 'N/A',
                    'status' => 'Active', // ✅ Always Active since it's not archived
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json($users, 200);
    }


    // ✅ Update User Details
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'username' => 'required|string|unique:users,username,' . $id,
            'email' => 'required|email|unique:users,email,' . $id,
            'role_id' => 'required|exists:roles,id', // ✅ Ensure role_id exists
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $user->update([
            'username' => $request->username,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ]);

        return response()->json(['message' => 'User updated successfully'], 200);
    }

    // ✅ Archive (Soft Delete) User
    public function archive($id)
    {
        $user = User::findOrFail($id);
        $user->delete(); // ✅ Soft delete the user
        return response()->json(['message' => 'User archived successfully'], 200);
    }

    // ✅ Restore Archived User
    public function restore($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore(); // ✅ Restore user
        return response()->json(['message' => 'User restored successfully'], 200);
    }

    // ✅ Get Archived Users
    public function archivedUsers()
    {
        $users = User::onlyTrashed() // ✅ Only get archived users
            ->with('role')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role->role_type ?? 'N/A',
                    'status' => 'Inactive', // ✅ Mark them as inactive
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json($users, 200);
    }
}
