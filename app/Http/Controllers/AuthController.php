<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{

    //REGISTER FUNCTION
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string', // ✅ Ensure validation includes username
            'email' => 'required|email|unique:users,email',
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'suffix' => 'nullable|string',
            'password' => 'required|string|min:6|confirmed', // ✅ 'confirmed' checks against 'password_confirmation'
        ]);


        $role = str_contains($request->email, '@admin.com') ? 'admin' : 'user';

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);



        return response()->json(['message' => 'User registered successfully!'], 201);
    }


    //LOGIN FUNCTION 
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();
            $token = $user->createToken('AuthToken')->accessToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }
}
