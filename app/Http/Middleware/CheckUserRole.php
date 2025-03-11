<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role  The required role (e.g., "user")
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized. No user logged in.'], 401);
        }
        if (!isset($user->role) || $user->role->name !== $role) {
            return response()->json(['message' => 'Unauthorized. Your role is not permitted.'], 403);
        }
        return $next($request);
    }
}
