<?php

use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        // Admin Dashboard
        Route::get('/dashboard', function () {
            // Get today's sales data for admin
            $todayOrders = \App\Models\Order::with(['user', 'orderItems.product'])
                ->where('status', 'completed')
                ->whereDate('created_at', \Illuminate\Support\Facades\Date::today())->latest()
                ->get();

            $totalSalesToday = $todayOrders->sum('total_amount');
            $totalOrdersToday = $todayOrders->count();

            // Low stock products
            $lowStockProducts = \App\Models\Product::where('stock_quantity', '<=', 10)
                ->orderBy('stock_quantity', 'asc')
                ->get();

            // Total products count
            $totalProducts = \App\Models\Product::count();

            // Product sales for today
            $productSales = [];
            foreach ($todayOrders as $order) {
                /** @var \App\Models\OrderItem $item */
                foreach ($order->orderItems as $item) {
                    $productId = $item->product_id;
                    if (!isset($productSales[$productId])) {
                        $productSales[$productId] = [
                            'product' => $item->product,
                            'quantity' => 0,
                            'revenue' => 0,
                        ];
                    }
                    $productSales[$productId]['quantity'] += $item->quantity;
                    $productSales[$productId]['revenue'] += floatval($item->price) * $item->quantity;
                }
            }

            usort($productSales, fn ($a, $b) => $b['quantity'] - $a['quantity']);

            return Inertia::render('Dashboard', [
                'isAdmin' => true,
                'todayOrders' => $todayOrders,
                'totalSalesToday' => $totalSalesToday,
                'totalOrdersToday' => $totalOrdersToday,
                'lowStockProducts' => $lowStockProducts,
                'totalProducts' => $totalProducts,
                'productSales' => $productSales,
            ]);
        })->name('dashboard');

        // Products Management
        Route::resource('products', ProductController::class);

        // Orders Management
        Route::resource('orders', OrderController::class)->except(['create', 'store', 'edit']);

        // Sales Reports
        Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');

        // Admin Profile
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
});
