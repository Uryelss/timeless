<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminSettingsController;

// Public routes
Route::post('register', [UsersController::class, 'register']);
Route::post('login', [UsersController::class, 'login']);

// Protected routes
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    // Admin only routes
    Route::get('/admin-dashboard', [UsersController::class, 'adminDashboard']);
});

// Protected user route (accessible to all authenticated users)
Route::middleware(['auth:api'])->group(function () {
    Route::get('/user-dashboard', [UsersController::class, 'userDashboard']);
    Route::get('/admin-settings', [AdminSettingsController::class, 'index']);

    // Add filter options

    Route::post('/add-filter/{type}', [AdminSettingsController::class, 'addFilter']);
});
