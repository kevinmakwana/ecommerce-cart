<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query();

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->get('search') . '%');
        }

        // Filter for low stock products
        if ($request->get('filter') === 'low_stock') {
            $query->where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0);
        }

        $products = $query->orderBy('name')->paginate(15);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'isAdmin' => auth()->check() ? auth()->user()->hasRole('admin') : false,
            'filters' => [
                'search' => $request->get('search'),
                'filter' => $request->get('filter'),
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        return Inertia::render('Products/Show', [
            'product' => $product,
            'isAdmin' => auth()->check() ? auth()->user()->hasRole('admin') : false,
        ]);
    }
}
