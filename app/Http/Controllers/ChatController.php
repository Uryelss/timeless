<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $chat = Chat::create([
            'user_id' => Auth::id(), // Store user ID if logged in
            'message' => $request->message,
            'is_bot' => false // Since it's a user message
        ]);

        return response()->json(['chat' => $chat]);
    }

    public function getChats()
    {
        return response()->json(Chat::latest()->get());
    }
}
