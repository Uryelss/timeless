<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // Add this import

class ReviewController extends Controller
{
    // Get all reviews for admin
    public function adminIndex()
    {
        $reviews = Review::with(['user' => function ($query) {
            $query->withTrashed(); // Include soft-deleted users
        }, 'user.profile', 'product'])
            ->latest()
            ->get()
            ->map(function ($review) {
                $username = 'Deleted User';
                if ($review->user) {
                    $username = $review->user->profile
                        ? ($review->user->profile->username ?? $review->user->username)
                        : ($review->user->username ?? $review->user->email ?? 'Unknown User');
                }

                // Use main_image instead of image, and prepend storage URL if needed
                $productImage = $review->product
                    ? Storage::url($review->product->main_image)
                    : 'https://via.placeholder.com/50';

                return [
                    'id' => $review->id,
                    'product_image' => $productImage,
                    'product_name' => $review->product ? $review->product->product_name : 'Unknown Product',
                    'username' => $username,
                    'rating' => $review->rating,
                    'review' => $review->comment,
                    'date_added' => $review->created_at->toDateString(),
                    'date_updated' => $review->updated_at->toDateString(),
                    'is_archived' => $review->is_archived ?? false,
                ];
            });

        return response()->json([
            'reviews' => $reviews->where('is_archived', false),
            'archived_reviews' => $reviews->where('is_archived', true),
        ]);
    }

    // Update a review
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

    // Archive a review
    public function archive($id)
    {
        $review = Review::findOrFail($id);
        $review->is_archived = true;
        $review->save();

        return response()->json(['message' => 'Review archived successfully']);
    }

    // Restore an archived review
    public function restore($id)
    {
        $review = Review::findOrFail($id);
        $review->is_archived = false;
        $review->save();

        return response()->json(['message' => 'Review restored successfully']);
    }

    // Delete a review permanently
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
