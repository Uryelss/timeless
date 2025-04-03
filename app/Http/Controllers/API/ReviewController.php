<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function adminIndex()
    {
        $reviews = Review::with(['user' => function ($query) {
            $query->withTrashed();
        }, 'user.profile', 'product'])
            ->latest()
            ->get()
            ->map(function ($review) {
                $profileImage = null;
                $firstName = 'Unknown';
                $lastName = '';
                $username = 'Deleted User';

                if ($review->user) {
                    $username = $review->user->profile
                        ? ($review->user->profile->username ?? $review->user->username)
                        : ($review->user->username ?? $review->user->email ?? 'Unknown User');
                    
                    if ($review->user->profile) {
                        $firstName = $review->user->profile->first_name ?? 'Unknown';
                        $lastName = $review->user->profile->last_name ?? '';
                        if ($review->user->profile->profile_image) {
                            $profileImage = str_starts_with($review->user->profile->profile_image, 'http')
                                ? $review->user->profile->profile_image
                                : Storage::url($review->user->profile->profile_image);
                        }
                    }
                }

                $productImage = $review->product
                    ? Storage::url($review->product->main_image)
                    : 'https://via.placeholder.com/50';

                return [
                    'id' => $review->id,
                    'profile_image' => $profileImage,
                    'profile' => $review->user && $review->user->profile ? [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'username' => $username,
                    ] : null,
                    'product_image' => $productImage,
                    'product_name' => $review->product ? $review->product->product_name : 'Unknown Product',
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->toDateString(),
                    'updated_at' => $review->updated_at->toDateString(),
                    'is_archived' => $review->is_archived ?? false,
                ];
            });

        return response()->json([
            'reviews' => array_values($reviews->where('is_archived', false)->all()),
            'archived_reviews' => array_values($reviews->where('is_archived', true)->all()),
        ]);
    }

    // ... (other methods remain unchanged)
}