<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    // Admin endpoint: Fetch all user conversations for the inbox.
    public function inbox(Request $request)
    {
        $conversations = ChatMessage::select('user_id', DB::raw('MAX(created_at) as last_message_time'))
            ->groupBy('user_id')
            ->orderBy('last_message_time', 'desc')
            ->get();

        $result = [];
        foreach ($conversations as $conversation) {
            $user = User::find($conversation->user_id);
            if ($user) { // Only include valid users
                $lastMessage = ChatMessage::where('user_id', $conversation->user_id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                $unreadCount = ChatMessage::where('user_id', $conversation->user_id)
                    ->where('sender_type', 'user')
                    ->where('is_read', false)
                    ->count();
                // Get the profile image from the user's profile relationship.
                $profileImage = $user->profile && $user->profile->profile_image
                    ? $user->profile->profile_image
                    : null;
                $result[] = [
                    'user_id'           => $conversation->user_id,
                    'username'          => $user->username ?? 'Unknown',
                    'profile_image'     => $profileImage,
                    'last_message'      => $lastMessage ? $lastMessage->message : '',
                    'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                    'unread_count'      => $unreadCount,
                ];
            }
        }
        return response()->json($result);
    }

    // Admin endpoint: Fetch messages for a specific user conversation.
    public function adminConversation(Request $request, $user_id)
    {
        $messages = ChatMessage::where('user_id', $user_id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread user messages as read.
        ChatMessage::where('user_id', $user_id)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    // User endpoint: Fetch conversation for a specific user.
    public function index(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->input('user_id');

        $messages = ChatMessage::where('user_id', $userId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Store a new chat message (works for both admin and user)
    public function store(Request $request)
    {
        $request->validate([
            'user_id'     => 'required|exists:users,id',
            'sender_type' => 'required|in:user,admin',
            'message'     => 'required|string',
        ]);

        $chatMessage = ChatMessage::create([
            'user_id'     => $request->input('user_id'),
            'sender_type' => $request->input('sender_type'),
            'message'     => $request->input('message'),
            'is_read'     => $request->input('sender_type') === 'admin' ? true : false,
        ]);

        return response()->json($chatMessage, 201);
    }
}
