<?php

namespace App\Http\Controllers;

use App\Jobs\LowStockNotification;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\Response as InertiaResponse;

class CartController extends Controller
{
    public function index(): Response
    {
        $cartItems = auth()->user()
            ->cartItems()
            ->with('product')
            ->get();

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'total' => $cartItems->sum(fn ($item) => floatval($item->product->price) * $item->quantity),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is out of stock
        if ($product->stock_quantity == 0) {
            return back()->withErrors(['quantity' => 'Product is out of stock.']);
        }

        // Check stock availability
        if ($product->stock_quantity < $request->quantity) {
            return back()->withErrors(['quantity' => 'Insufficient stock available.']);
        }

        $cartItem = auth()->user()->cartItems()->where('product_id', $request->product_id)->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;

            if ($product->stock_quantity < $newQuantity) {
                return back()->withErrors(['quantity' => 'Insufficient stock available.']);
            }

            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            auth()->user()->cartItems()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('success', 'Product added to cart!');
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        if ($cartItem->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        // Check stock availability
        if ($cartItem->product->stock_quantity < $request->quantity) {
            return back()->withErrors(['quantity' => 'Insufficient stock available.']);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return back()->with('success', 'Cart updated!');
    }

    public function destroy(CartItem $cartItem): RedirectResponse
    {
        if ($cartItem->user_id !== auth()->id()) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('success', 'Item removed from cart!');
    }

    public function checkout(): InertiaResponse|RedirectResponse
    {
        $user = auth()->user();
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Your cart is empty.');
        }

        // Validate stock availability before creating checkout session
        foreach ($cartItems as $cartItem) {
            $product = $cartItem->product;
            if ($product->stock_quantity < $cartItem->quantity) {
                return back()->with('error', "Insufficient stock for {$product->name}");
            }
        }

        // Build line items for Stripe Checkout
        $lineItems = [];
        foreach ($cartItems as $cartItem) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'unit_amount' => (int) (floatval($cartItem->product->price) * 100), // Convert to cents
                    'product_data' => [
                        'name' => $cartItem->product->name,
                        'description' => $cartItem->product->description,
                    ],
                ],
                'quantity' => $cartItem->quantity,
            ];
        }

        try {
            // Create Stripe Checkout Session
            $checkoutSession = $user->checkout($lineItems, [
                'success_url' => route('checkout.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('checkout.cancel'),
                'mode' => 'payment',
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);

            return inertia()->location($checkoutSession->url);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create checkout session: ' . $e->getMessage());
        }
    }

    public function checkoutSuccess(Request $request): RedirectResponse
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            return to_route('cart.index')->with('error', 'Invalid session.');
        }

        $user = auth()->user();

        try {
            // Retrieve the Stripe session
            $session = $user->stripe()->checkout->sessions->retrieve($sessionId);

            // Verify payment was successful
            if ($session->payment_status !== 'paid') {
                return to_route('cart.index')->with('error', 'Payment was not completed.');
            }

            // Process the order
            $cartItems = $user->cartItems()->with('product')->get();

            if ($cartItems->isEmpty()) {
                return to_route('products.index')->with('info', 'Your cart is already empty.');
            }

            DB::transaction(function () use ($user, $cartItems, $session) {
                // Create order
                $order = Order::create([
                    'user_id' => $user->id,
                    'total_amount' => $session->amount_total / 100, // Convert from cents
                    'status' => 'completed',
                ]);

                // Create order items and update stock
                foreach ($cartItems as $cartItem) {
                    $product = $cartItem->product;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $cartItem->quantity,
                        'price' => $product->price,
                    ]);

                    // Update stock
                    $newStock = $product->stock_quantity - $cartItem->quantity;
                    $product->update(['stock_quantity' => $newStock]);

                    // Dispatch low stock notification if needed (threshold: 10)
                    if ($newStock <= 10 && $newStock > 0) {
                        dispatch(new LowStockNotification($product));
                    }

                    // Delete cart item
                    $cartItem->delete();
                }
            });

            return to_route('products.index')->with('success', 'Order placed successfully! Payment confirmed.');
        } catch (\Exception $e) {
            return to_route('cart.index')->with('error', 'Failed to process order: ' . $e->getMessage());
        }
    }

    public function checkoutCancel(): RedirectResponse
    {
        return to_route('cart.index')->with('info', 'Checkout cancelled. Your items are still in your cart.');
    }
}
