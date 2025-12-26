<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        // Only regular users can access this - admins should use /admin/orders
        if ($user->hasRole('admin')) {
            abort(403, 'Admins should access orders through the admin panel.');
        }

        // Get only the authenticated user's orders with pagination
        $orders = $user->orders()
            ->with('orderItems.product')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'stripe_payment_intent_id' => ['required', 'string'],
        ]);

        $user = auth()->user();
        $cartItems = $user->cartItems()->with('product')->get();

        // Check if cart is empty
        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Your cart is empty.');
        }

        // Check stock availability for all items
        /** @var \App\Models\CartItem $cartItem */
        foreach ($cartItems as $cartItem) {
            if ($cartItem->product->stock_quantity < $cartItem->quantity) {
                return back()->with('error', "Insufficient stock for {$cartItem->product->name}.");
            }
        }

        // Calculate total
        $total = $cartItems->sum(fn ($item) => floatval($item->product->price) * $item->quantity);

        DB::transaction(function () use ($user, $cartItems, $total, $request) {
            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $total,
                'status' => 'completed',
                'stripe_payment_intent_id' => $request->stripe_payment_intent_id,
            ]);

            // Create order items and reduce stock
            /** @var \App\Models\CartItem $cartItem */
            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->product->price,
                ]);

                // Reduce product stock
                $cartItem->product->decrement('stock_quantity', $cartItem->quantity);
            }

            // Clear cart
            $user->cartItems()->delete();
        });

        return to_route('orders.index')->with('success', 'Order placed successfully!');
    }
}
