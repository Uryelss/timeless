<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, $role)
    {
        // Check if the authenticated user's role matches the required role
        if (Auth::check() && Auth::user()->role->role_type !== $role) {
            // If the role doesn't match, return an unauthorized response or redirect
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
