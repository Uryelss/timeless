<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;
use App\Http\Controllers\API\SubCategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\InventoryController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\ProductViewController;

// Logout route for authenticated users (using Passport)
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AccessController::class, 'logout']);
});

// Public routes (accessible without authentication)
Route::post('register', [AccessController::class, 'register']);
Route::post('login', [AccessController::class, 'login']);
Route::get('/products/public', [ProductController::class, 'publicIndex']);
Route::get('/sub-categories/public', [SubCategoryController::class, 'publicIndex']);
// Public product detail route
Route::get('/products/{id}', [ProductViewController::class, 'show']);

// Protected routes for regular users
Route::middleware(['auth:api', 'check.role:user'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
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

    // Inventory routes
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory/{product_id}', [InventoryController::class, 'store']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);
    Route::post('/inventory/{id}/restore', [InventoryController::class, 'restore']);

    // User Management routes
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/restore', [UserController::class, 'restore']);

    // Customer routes
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);
    Route::post('/customers/{id}/restore', [CustomerController::class, 'restore']);
});
