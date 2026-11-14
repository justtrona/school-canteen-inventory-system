
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\InventoryDashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\StockInController;
use App\Http\Controllers\StockOutController;
use App\Http\Controllers\StockHistoryController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SalesController;

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

    // Dashboard
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

    // Suppliers
    Route::get('/inventory/suppliers', [
        SupplierController::class,
        'index'
    ])->name('inventory.suppliers.index');

    Route::post('/inventory/suppliers', [
        SupplierController::class,
        'store'
    ])->name('inventory.suppliers.store');

    Route::put('/inventory/suppliers/{supplier}', [
        SupplierController::class,
        'update'
    ])->name('inventory.suppliers.update');

    Route::patch('/inventory/suppliers/{supplier}/deactivate', [
        SupplierController::class,
        'deactivate'
    ])->name('inventory.suppliers.deactivate');

    Route::patch('/inventory/suppliers/{supplier}/reactivate', [
        SupplierController::class,
        'reactivate'
    ])->name('inventory.suppliers.reactivate');

    // Stock In
    Route::get('/inventory/stock-in', [
        StockInController::class,
        'index'
    ])->name('inventory.stock-in.index');

    Route::post('/inventory/stock-in', [
        StockInController::class,
        'store'
    ])->name('inventory.stock-in.store');

    // Stock Out
    Route::get('/inventory/stock-out', [
        StockOutController::class,
        'index'
    ])->name('inventory.stock-out.index');

    Route::post('/inventory/stock-out', [
        StockOutController::class,
        'store'
    ])->name('inventory.stock-out.store');

    // Stock History
    Route::get('/inventory/stock-history', [
        StockHistoryController::class,
        'index'
    ])->name('inventory.stock-history.index');

    // Logout
    Route::post('/logout', [
        AuthenticatedSessionController::class,
        'destroy'
    ])->name('logout');

    // Superadmin
    Route::middleware('superadmin')->group(function () {

        // Point of Sale
        Route::get('/pos', [
            POSController::class,
            'index'
        ])->name('pos.index');

        // Orders
        Route::get('/orders', [
            OrderController::class,
            'index'
        ])->name('orders.index');

        Route::get('/orders/{order}', [
            OrderController::class,
            'show'
        ])->whereNumber('order')->name('orders.show');

        // Payments
        Route::get('/payments', [
            PaymentController::class,
            'index'
        ])->name('payments.index');

        // Sales
        Route::get('/sales', [
            SalesController::class,
            'index'
        ])->name('sales.index');

        // Superadmin Test
        Route::get('/superadmin/test', function () {
            return response()->json([
                'message' => 'Superadmin access granted.',
            ]);
        })->name('superadmin.test');

    });
});
