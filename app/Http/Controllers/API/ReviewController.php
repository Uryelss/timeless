<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // Get all reviews for a product
    public function index($product_id)
    {
        $reviews = Review::where('product_id', $product_id)
            ->with('user.profile') // Get profile info (username, image)
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    // Store a new review
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'comment' => 'required|string',
            'rating' => 'integer|min:1|max:5'
        ]);

        $user = Auth::user();
        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'comment' => $request->comment,
            'rating' => $request->rating ?? 5,
        ]);

        // Load the user relationship with profile
        $review->load('user.profile');

        return response()->json(['message' => 'Review added successfully', 'review' => $review]);
    }
}
