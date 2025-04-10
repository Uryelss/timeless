<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function index($id)
    {
        $reviews = Review::where('product_id', $id)
            ->where('is_archived', false)
            ->with(['user' => function ($query) {
                $query->withTrashed();
            }, 'user.profile'])
            ->latest()
            ->get()
            ->map(function ($review) {
                $username = 'Deleted User';
                $profileImage = null;

                if ($review->user) {
                    $username = $review->user->profile
                        ? ($review->user->profile->username ?? $review->user->username)
                        : ($review->user->username ?? $review->user->email ?? 'Unknown User');

                    if ($review->user->profile && $review->user->profile->profile_image) {
                        $profileImage = str_starts_with($review->user->profile->profile_image, 'http')
                            ? $review->user->profile->profile_image
                            : Storage::url($review->user->profile->profile_image);
                    }
                }

                return [
                    'id' => $review->id,
                    'user' => [
                        'username' => $username,
                        'profile' => $review->user->profile ? [
                            'profile_image' => $profileImage,
                        ] : null,
                    ],
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->toDateString(),
                ];
            });

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'comment' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $review = Review::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'comment' => $request->comment,
            'rating' => $request->rating,
        ]);

        $review->load(['user' => function ($query) {
            $query->withTrashed();
        }, 'user.profile']);

        $username = $review->user->profile
            ? ($review->user->profile->username ?? $review->user->username)
            : ($review->user->username ?? $review->user->email ?? 'Unknown User');

        $profileImage = $review->user->profile && $review->user->profile->profile_image
            ? (str_starts_with($review->user->profile->profile_image, 'http')
                ? $review->user->profile->profile_image
                : Storage::url($review->user->profile->profile_image))
            : null;

        return response()->json([
            'message' => 'Review created successfully',
            'review' => [
                'id' => $review->id,
                'user' => [
                    'username' => $username,
                    'profile' => $review->user->profile ? [
                        'profile_image' => $profileImage,
                    ] : null,
                ],
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->toDateString(),
            ]
        ], 201);
    }

    public function adminIndex()
    {
        $reviews = Review::with(['user' => function ($query) {
            $query->withTrashed();
        }, 'user.profile', 'product'])
            ->latest()
            ->get()
            ->map(function ($review) {
                $username = 'Deleted User';
                $profileImage = null;

                if ($review->user) {
                    $username = $review->user->profile
                        ? ($review->user->profile->username ?? $review->user->username)
                        : ($review->user->username ?? $review->user->email ?? 'Unknown User');

                    if ($review->user->profile && $review->user->profile->profile_image) {
                        $profileImage = str_starts_with($review->user->profile->profile_image, 'http')
                            ? $review->user->profile->profile_image
                            : Storage::url($review->user->profile->profile_image);
                    }
                }

                $productImage = $review->product
                    ? Storage::url($review->product->main_image)
                    : 'https://via.placeholder.com/50';

                return [
                    'id' => $review->id,
                    'product_image' => $productImage,
                    'product_name' => $review->product ? $review->product->product_name : 'Unknown Product',
                    'username' => $username,
                    'profile_image' => $profileImage, // Added profile_image
                    'rating' => $review->rating,
                    'review' => $review->comment,
                    'date_added' => $review->created_at->toDateString(),
                    'date_updated' => $review->updated_at->toDateString(),
                    'is_archived' => $review->is_archived ?? false,
                ];
            });

        return response()->json([
            'reviews' => array_values($reviews->where('is_archived', false)->all()),
            'archived_reviews' => array_values($reviews->where('is_archived', true)->all()),
        ]);
    }

    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $request->validate([
            'comment' => 'sometimes|string',
            'rating' => 'sometimes|integer|min:1|max:5',
        ]);

        $review->update($request->only(['comment', 'rating']));
        $review->load(['user' => function ($query) {
            $query->withTrashed();
        }, 'user.profile', 'product']);

        return response()->json(['message' => 'Review updated successfully', 'review' => $review]);
    }

    public function archive($id)
    {
        $review = Review::findOrFail($id);
        $review->is_archived = true;
        $review->save();

        return response()->json(['message' => 'Review archived successfully']);
    }

    public function restore($id)
    {
        $review = Review::findOrFail($id);
        $review->is_archived = false;
        $review->save();

        return response()->json(['message' => 'Review restored successfully']);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}