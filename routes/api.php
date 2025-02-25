<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AdminSettingsController;
use Illuminate\Support\Facades\Route;

// Public routes (No authentication required)
Route::post('register', [UsersController::class, 'register']);
Route::post('login', [UsersController::class, 'login']);

// Protected routes (Require authentication)
Route::middleware(['auth:api'])->group(function () {
    // Admin Settings Endpoints
    Route::get('/admin-settings', [AdminSettingsController::class, 'index']); // ✅ Fetch filters
    Route::post('/add-filter/{type}', [AdminSettingsController::class, 'addFilter']); // ✅ Add new filter

    // Product Management Endpoints
    Route::get('/products', [ProductController::class, 'index']); // ✅ Get products
    Route::post('/products/store', [ProductController::class, 'store']); // ✅ Store new product
    Route::get('/products/create', [ProductController::class, 'create']); // ✅ Fetch dropdowns
    Route::put('/products/{id}', [ProductController::class, 'update']); // ✅ Update product
});

// Admin-only routes
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::get('/admin-dashboard', [UsersController::class, 'adminDashboard']);
});
