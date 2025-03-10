<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;
use App\Http\Controllers\API\SubCategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\UserProfileController; // Add UserProfileController

Route::post('register', [AccessController::class, 'register']);
Route::post('login', [AccessController::class, 'login']);

// Protected routes for authenticated users
Route::middleware(['auth:api'])->group(function () {
    Route::get('user', [UserProfileController::class, 'getuserprofile']); // Fetch user profile
    Route::post('update-profile', [UserProfileController::class, 'updateuserprofile']); // Update user profile
});

// Protected routes for admin
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::get('admin-dashboard', function () {
        return response()->json(['message' => 'Welcome to the Admin Dashboard']);
    });

    // SubCategory routes
    Route::get('/sub-categories', [SubCategoryController::class, 'index']);
    Route::post('/sub-categories', [SubCategoryController::class, 'store']);
    Route::put('/sub-categories/{id}', [SubCategoryController::class, 'update']);
    Route::delete('/sub-categories/{id}', [SubCategoryController::class, 'destroy']);
    Route::post('/sub-categories/{id}/restore', [SubCategoryController::class, 'restore']);

    // Product routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/restore', [ProductController::class, 'restore']);

    // Customer routes
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);
    Route::post('/customers/{id}/restore', [CustomerController::class, 'restore']);
});

