<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AdminSettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminCustomerController;

// ✅ PUBLIC ROUTES (No authentication required)
Route::get('/store/products', [ProductController::class, 'getActiveProducts']); // ✅ Fetch active products
Route::get('/admin-settings', [AdminSettingsController::class, 'index']); // ✅ Allow fetching filters without login

// Public Auth Routes
Route::post('register', [UsersController::class, 'register']);
Route::post('login', [UsersController::class, 'login']);
Route::post('/logout', [UsersController::class, 'logout'])->middleware('auth:api');
// Admin-only routes
Route::middleware(['auth:api', 'role:admin'])->group(function () {

    // Admin Settings Endpoints
    // ✅ Admin Settings Endpoints
    Route::post('/add-filter/{type}', [AdminSettingsController::class, 'addFilter']); // ✅ Add new filter
    Route::put('/update-filter/{type}/{id}', [AdminSettingsController::class, 'updateFilter']); // ✅ Update filter
    Route::put('/archive-filter/{type}/{id}', [AdminSettingsController::class, 'archiveFilter']); // ✅ Archive filter
    Route::put('/restore-filter/{type}/{id}', [AdminSettingsController::class, 'restoreFilter']); // ✅ Restore filter

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


    Route::get('/admin-dashboard', [UsersController::class, 'adminDashboard']);
    //customers
    Route::get('/customers', [AdminCustomerController::class, 'index']);
    Route::post('/customers/{id}/update', [AdminCustomerController::class, 'update']);
    Route::put('/customers/{id}/archive', [AdminCustomerController::class, 'archive']);
    Route::put('/customers/{id}/restore', [AdminCustomerController::class, 'restore']);
    Route::get('/customers/{id}', [AdminCustomerController::class, 'show']); // ✅ Fetch single customer



    //users
    Route::get('/users', [AdminUserController::class, 'index']); // ✅ Get all users
    Route::put('/users/{id}', [AdminUserController::class, 'update']); // ✅ Update user
    Route::put('/users/{id}/archive', [AdminUserController::class, 'archive']); // ✅ Archive user
    Route::put('/users/{id}/restore', [AdminUserController::class, 'restore']); // ✅ Restore user
    Route::get('/users/archived', [AdminUserController::class, 'archivedUsers']); // ✅ Get archived users
});
