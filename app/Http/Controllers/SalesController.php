<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->get('period', 'today');

        $query = Order::with(['user', 'orderItems.product'])
            ->where('status', 'completed');

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', \Illuminate\Support\Facades\Date::today());
                break;
            case 'week':
                $query->whereBetween('created_at', [\Illuminate\Support\Facades\Date::now()->startOfWeek(), \Illuminate\Support\Facades\Date::now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', \Illuminate\Support\Facades\Date::now()->month)
                    ->whereYear('created_at', \Illuminate\Support\Facades\Date::now()->year);
                break;
            case 'all':
                // No filter
                break;
        }

        $orders = $query->latest()->get();

        $totalSales = $orders->sum('total_amount');
        $totalOrders = $orders->count();

        // Get product sales breakdown
        $productSales = [];
        foreach ($orders as $order) {
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

        // Sort by quantity sold
        usort($productSales, fn ($productA, $productB) => $productB['quantity'] - $productA['quantity']);

        return Inertia::render('Sales/Index', [
            'orders' => $orders,
            'totalSales' => $totalSales,
            'totalOrders' => $totalOrders,
            'productSales' => $productSales,
            'period' => $period,
        ]);
    }
}
