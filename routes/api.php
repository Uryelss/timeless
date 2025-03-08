<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;
use App\Http\Controllers\API\SubCategoryController;
use App\Http\Controllers\API\ProductController;

Route::post('register', [AccessController::class, 'register']);
Route::post('login', [AccessController::class, 'login']);

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
});
