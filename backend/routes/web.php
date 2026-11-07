<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\InventoryDashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;

Route::get('/', function () {
    return redirect('/login');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [
        AuthenticatedSessionController::class,
        'create'
    ])->name('login');

    Route::post('/login', [
        AuthenticatedSessionController::class,
        'store'
    ]);
});

Route::middleware(['auth', 'active'])->group(function () {

    Route::get('/dashboard', [
        InventoryDashboardController::class,
        'index'
    ])->name('dashboard');

    // Products
    Route::get('/inventory/products', [
        ProductController::class,
        'index'
    ])->name('inventory.products.index');

    Route::get('/inventory/products/next-sku', [
        ProductController::class,
        'nextSku'
    ])->name('inventory.products.next-sku');

    Route::post('/inventory/products', [
        ProductController::class,
        'store'
    ])->name('inventory.products.store');

    Route::put('/inventory/products/{product}', [
        ProductController::class,
        'update'
    ])->name('inventory.products.update');

    Route::patch('/inventory/products/{product}/archive', [
        ProductController::class,
        'archive'
    ])->name('inventory.products.archive');

    Route::patch('/inventory/products/{product}/restore', [
        ProductController::class,
        'restore'
    ])->name('inventory.products.restore');

    // Categories
    Route::get('/inventory/categories', [
        CategoryController::class,
        'index'
    ])->name('inventory.categories.index');

    Route::post('/inventory/categories', [
        CategoryController::class,
        'store'
    ])->name('inventory.categories.store');

    Route::put('/inventory/categories/{category}', [
        CategoryController::class,
        'update'
    ])->name('inventory.categories.update');

    Route::patch('/inventory/categories/{category}/archive', [
        CategoryController::class,
        'archive'
    ])->name('inventory.categories.archive');

    Route::patch('/inventory/categories/{category}/restore', [
        CategoryController::class,
        'restore'
    ])->name('inventory.categories.restore');

    // Logout
    Route::post('/logout', [
        AuthenticatedSessionController::class,
        'destroy'
    ])->name('logout');

    // Superadmin
    Route::middleware('superadmin')->group(function () {
        Route::get('/superadmin/test', function () {
            return response()->json([
                'message' => 'Superadmin access granted.',
            ]);
        })->name('superadmin.test');
    });
});
