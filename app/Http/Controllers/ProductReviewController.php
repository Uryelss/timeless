<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductReview;
use Illuminate\Support\Facades\Auth;

class ProductReviewController extends Controller
{
    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string'
        ]);

        $user = Auth::user(); // ✅ Get the authenticated user

        $review = ProductReview::create([
            'product_id' => $productId,
            'user_id' => $user->id,
            'rating' => $request->rating,
            'review' => $request->review
        ]);

        // ✅ Ensure the profile image is correctly formatted
        $profileImage = $user->profile_image
            ? asset('storage/' . ltrim($user->profile_image, '/'))
            : asset('default-profile.png');

        return response()->json([
            'message' => 'Review added successfully',
            'review' => [
                'rating' => $review->rating,
                'review' => $review->review,
                'user' => [
                    'username' => $user->username,
                    'profile_image' => $profileImage, // ✅ Now it includes the correct profile image
                ]
            ]
        ], 201);
    }
}
