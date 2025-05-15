<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // Admin endpoint: Fetch all user conversations for the inbox
    public function inbox(Request $request)
    {
        $conversations = ChatMessage::select('user_id', DB::raw('MAX(created_at) as last_message_time'))
            ->groupBy('user_id')
            ->orderBy('last_message_time', 'desc')
            ->get();

        $result = [];
        foreach ($conversations as $conversation) {
            $user = User::find($conversation->user_id);
            if ($user) {
                $lastMessage = ChatMessage::where('user_id', $conversation->user_id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                $unreadCount = ChatMessage::where('user_id', $conversation->user_id)
                    ->where('sender_type', 'user')
                    ->where('is_read', false)
                    ->count();
                $profileImage = $user->profile && $user->profile->profile_image
                    ? Storage::url($user->profile->profile_image)
                    : null;
                $result[] = [
                    'user_id' => $conversation->user_id,
                    'username' => $user->username ?? 'Unknown',
                    'profile_image' => $profileImage,
                    'last_message' => $lastMessage ? $lastMessage->message : '',
                    'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                    'unread_count' => $unreadCount,
                ];
            }
        }
        return response()->json($result);
    }

    // Admin endpoint: Fetch messages for a specific user conversation
    public function adminConversation(Request $request, $user_id)
    {
        $messages = ChatMessage::where('user_id', $user_id)
            ->orderBy('created_at', 'asc')
            ->get();

        ChatMessage::where('user_id', $user_id)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    // User endpoint: Fetch conversation for a specific user
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

    // Fetch admin profile
    public function getAdminProfile(Request $request)
    {
        $admin = User::where('role_id', 1)->first();
        if (!$admin) {
            Log::error('Admin user not found for role_id=1');
            return response()->json(['error' => 'Admin not found'], 404);
        }

        $profile = [
            'username' => $admin->username ?? 'Support Admin',
            'profile_image' => null,
            'first_name' => null,
            'last_name' => null,
        ];

        if ($admin->profile && $admin->profile->profile_image) {
            $profileImage = Storage::url($admin->profile->profile_image);
            $profile['profile_image'] = $profileImage;
            $profile['first_name'] = $admin->profile->first_name;
            $profile['last_name'] = $admin->profile->last_name;
            Log::info('Admin profile image retrieved', ['profile_image' => $profileImage]);
        } else {
            Log::warning('Admin profile or profile image not set', ['admin_id' => $admin->id]);
        }

        return response()->json($profile);
    }

    // Fetch user profile
    public function getUserProfile(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $profile = $user->profile ? [
            'username' => $user->username,
            'profile_image' => $user->profile->profile_image ? Storage::url($user->profile->profile_image) : null,
            'first_name' => $user->profile->first_name,
            'last_name' => $user->profile->last_name,
        ] : [
            'username' => $user->username,
            'profile_image' => null,
            'first_name' => null,
            'last_name' => null,
        ];

        return response()->json($profile);
    }

    // Store a new chat message
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'sender_type' => 'required|in:user,admin',
            'message' => 'nullable|string|required_without:image',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = [
            'user_id' => $request->input('user_id'),
            'sender_type' => $request->input('sender_type'),
            'message' => $request->input('message') ?? '',
            'is_read' => $request->input('sender_type') === 'admin' ? true : false,
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('chat_images', 'public');
            $data['image'] = Storage::url($path);
        }

        $chatMessage = ChatMessage::create($data);

        return response()->json($chatMessage, 201);
    }

    // Get current authenticated user
    public function getCurrentUser()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
        ]);
    }
}
