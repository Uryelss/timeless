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
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\UserOrderController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AccessController::class, 'register'])->name('register');
Route::post('/login', [AccessController::class, 'login'])->name('login');
Route::get('/products/public', [ProductController::class, 'publicIndex'])->name('products.public');
Route::get('/sub-categories/public', [SubCategoryController::class, 'publicIndex'])->name('subcategories.public');
Route::get('/products/{id}', [ProductViewController::class, 'show'])->name('products.show');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Requires API Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {
    // Authentication-related routes
    Route::post('/logout', [AccessController::class, 'logout'])->name('logout');
    Route::get('/validate-token', [AccessController::class, 'validateToken'])->name('validate.token');

    // Review routes
    Route::get('/reviews/{product_id}', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    // Inventory public route
    Route::get('/inventory-public', [InventoryController::class, 'index'])->name('inventory.public');

    // Lookup table routes
    Route::get('/payment-methods', fn() => App\Models\PaymentMethod::all())->name('payment.methods');
    Route::get('/shipping-methods', fn() => App\Models\ShippingMethod::all())->name('shipping.methods');
});

/*
|--------------------------------------------------------------------------
| User Routes (Requires 'user' Role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'check.role:user'])->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Order creation route (adjusted to match CheckoutPage)
    Route::post('/orders', [UserOrderController::class, 'store'])->name('orders.store');
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Requires 'admin' Role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'admin'])->group(function () {
    // Admin dashboard
    Route::get('/admin-dashboard', fn() => response()->json(['message' => 'Welcome to the Admin Dashboard']))
        ->name('admin.dashboard');

    // SubCategory routes
    Route::prefix('sub-categories')->name('subcategories.')->group(function () {
        Route::get('/', [SubCategoryController::class, 'index'])->name('index');
        Route::post('/', [SubCategoryController::class, 'store'])->name('store');
        Route::put('/{id}', [SubCategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [SubCategoryController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [SubCategoryController::class, 'restore'])->name('restore');
    });

    // Product routes
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::post('/', [ProductController::class, 'store'])->name('store');
        Route::put('/{id}', [ProductController::class, 'update'])->name('update');
        Route::delete('/{id}', [ProductController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [ProductController::class, 'restore'])->name('restore');
    });

    // Inventory routes
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])->name('index');
        Route::post('/{product_id}', [InventoryController::class, 'store'])->name('store');
        Route::put('/{id}', [InventoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [InventoryController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [InventoryController::class, 'restore'])->name('restore');
    });

    // User management routes
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [UserController::class, 'restore'])->name('restore');
    });

    // Customer routes
    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/{id}', [CustomerController::class, 'show'])->name('show');
        Route::put('/{id}', [CustomerController::class, 'update'])->name('update');
        Route::delete('/{id}', [CustomerController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [CustomerController::class, 'restore'])->name('restore');
    });

    // Order management routes (admin)
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/{id}', [OrderController::class, 'show'])->name('show');
        Route::put('/{id}', [OrderController::class, 'update'])->name('update');
        Route::post('/{id}/archive', [OrderController::class, 'archive'])->name('archive');
        Route::post('/{id}/restore', [OrderController::class, 'restore'])->name('restore');
    });
});
