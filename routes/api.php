<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;
use App\Http\Controllers\API\SubCategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\InventoryController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\PasswordController;
use App\Http\Controllers\API\ProductViewController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\PaymentMethodController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\UserOrderController;
use App\Http\Controllers\API\AddressController;
use App\Http\Controllers\API\ForgotPasswordController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\ReturnRefundController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyResetCode']);
Route::post('/reset-password', [ForgotPasswordController::class, 'reset']);
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
    Route::post('/logout', [AccessController::class, 'logout'])->name('logout');
    Route::get('/validate-token', [AccessController::class, 'validateToken'])->name('validate.token');
    Route::get('/reviews/{product_id}', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('/inventory-public', [InventoryController::class, 'index'])->name('inventory.public');
    Route::get('/payment-methods', [PaymentMethodController::class, 'index'])->name('payment.methods.index');
    Route::get('/shipping-methods', fn() => App\Models\ShippingMethod::all())->name('shipping.methods');
    Route::get('/my-purchases', [UserOrderController::class, 'myPurchases'])->name('user.orders.my_purchases');
    Route::get('/users/me', [UserController::class, 'getCurrentUser'])->name('users.me');
    Route::get('/user/{id}', [ChatController::class, 'getUserProfile'])->name('user.show');
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
    Route::get('/admin/profile', [ChatController::class, 'getAdminProfile'])->name('admin.profile');
    Route::post('/return-refunds', [ReturnRefundController::class, 'store'])->name('return-refunds.store');
});

/*
|--------------------------------------------------------------------------
| User Routes (Requires 'user' Role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'check.role:user'])->group(function () {
    Route::post('/orders/{id}/confirm-receipt', [OrderController::class, 'confirmReceipt'])->name('orders.confirm-receipt');
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/orders/create', [UserOrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'userOrders'])->name('orders.user');
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::get('/addresses', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::put('/addresses/{id}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::put('/addresses/{id}/set-default', [AddressController::class, 'setDefault'])->name('addresses.set-default');
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Requires 'admin' Role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::get('/admin-dashboard', fn() => response()->json(['message' => 'Welcome to the Admin Dashboard']))->name('admin.dashboard');
    Route::get('/admin/my-profile', [ProfileController::class, 'show'])->name('admin.profile.show'); // Changed to avoid conflict
    Route::post('/admin/profile', [ProfileController::class, 'update'])->name('admin.profile.update');
    Route::post('/admin/password', [PasswordController::class, 'update'])->name('admin.password.update');

    Route::prefix('sub-categories')->name('subcategories.')->group(function () {
        Route::get('/', [SubCategoryController::class, 'index'])->name('index');
        Route::post('/', [SubCategoryController::class, 'store'])->name('store');
        Route::put('/{id}', [SubCategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [SubCategoryController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [SubCategoryController::class, 'restore'])->name('restore');
    });

    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::post('/', [ProductController::class, 'store'])->name('store');
        Route::put('/{id}', [ProductController::class, 'update'])->name('update');
        Route::delete('/{id}', [ProductController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [ProductController::class, 'restore'])->name('restore');
    });

    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])->name('index');
        Route::post('/{product_id}', [InventoryController::class, 'store'])->name('store');
        Route::put('/{id}', [InventoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [InventoryController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [InventoryController::class, 'restore'])->name('restore');
    });

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [UserController::class, 'restore'])->name('restore');
    });

    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/{id}', [CustomerController::class, 'show'])->name('show');
        Route::put('/{id}', [CustomerController::class, 'update'])->name('update');
        Route::delete('/{id}', [CustomerController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [CustomerController::class, 'restore'])->name('restore');
    });

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/{id}', [OrderController::class, 'show'])->name('show');
        Route::put('/{id}', [OrderController::class, 'update'])->name('update');
        Route::post('/{id}/archive', [OrderController::class, 'archive'])->name('archive');
        Route::post('/{id}/restore', [OrderController::class, 'restore'])->name('restore');
    });

    Route::prefix('return-refunds')->name('return-refunds.')->group(function () {
        Route::get('/', [ReturnRefundController::class, 'index'])->name('index');
        Route::get('/archived', [ReturnRefundController::class, 'index'])->defaults('archived', true)->name('archived');
        Route::put('/{id}', [ReturnRefundController::class, 'update'])->name('update');
        Route::post('/{id}/archive', [ReturnRefundController::class, 'archive'])->name('archive');
        Route::post('/{id}/restore', [ReturnRefundController::class, 'restore'])->name('restore');
    });

    Route::prefix('admin/reviews')->name('admin.reviews.')->group(function () {
        Route::get('/', [ReviewController::class, 'adminIndex'])->name('index');
        Route::put('/{id}', [ReviewController::class, 'update'])->name('update');
        Route::delete('/{id}', [ReviewController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/archive', [ReviewController::class, 'archive'])->name('archive');
        Route::post('/{id}/restore', [ReviewController::class, 'restore'])->name('restore');
    });

    Route::get('/admin/chat/inbox', [ChatController::class, 'inbox'])->name('chat.inbox');
    Route::get('/admin/chat/{user_id}', [ChatController::class, 'adminConversation'])->name('chat.adminConversation');
    Route::post('/admin/chat', [ChatController::class, 'store'])->name('chat.adminStore');
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::put('/{id}', [TransactionController::class, 'update'])->name('update');
        Route::post('/{id}/archive', [TransactionController::class, 'archive'])->name('archive');
        Route::post('/{id}/restore', [TransactionController::class, 'restore'])->name('restore');
    });
});
