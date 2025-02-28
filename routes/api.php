<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AdminSettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\AdminUserController;


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
    Route::put('/products/{id}/archive', [ProductController::class, 'archive']); // ✅ Change DELETE to PUT
    Route::put('/products/{id}/restore', [ProductController::class, 'restore']); // ✅ Restore
    Route::get('/products/archived', [ProductController::class, 'archivedProducts']); // ✅ Get archived products



    //inventory
    Route::get('/inventory', [InventoryController::class, 'index']); // ✅ Get all inventory items
    Route::put('/inventory/{id}', [InventoryController::class, 'update']); // ✅ Update inventory
    Route::put('/inventory/{id}/archive', [InventoryController::class, 'archive']); // ✅ Archive inventory
    Route::put('/inventory/{id}/restore', [InventoryController::class, 'restore']); // ✅ Restore inventory
    Route::get('/inventory/archived', [InventoryController::class, 'archivedItems']); // ✅ Get archived inventory
});

// Admin-only routes
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::get('/admin-dashboard', [UsersController::class, 'adminDashboard']);




    Route::get('/users', [AdminUserController::class, 'index']); // ✅ Get all users
    Route::put('/users/{id}', [AdminUserController::class, 'update']); // ✅ Update user
    Route::put('/users/{id}/archive', [AdminUserController::class, 'archive']); // ✅ Archive user
    Route::put('/users/{id}/restore', [AdminUserController::class, 'restore']); // ✅ Restore user
    Route::get('/users/archived', [AdminUserController::class, 'archivedUsers']); // ✅ Get archived users
});
