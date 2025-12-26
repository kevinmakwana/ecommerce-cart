<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_orders(): void
    {
        $response = $this->get('/orders');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_orders_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/orders');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Orders/Index')
        );
    }

    public function test_user_can_create_order_from_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'price' => 100.00,
            'stock_quantity' => 10,
        ]);

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->post('/orders', [
            'stripe_payment_intent_id' => 'test_payment_intent_123',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_amount' => '200.00',
            'status' => 'completed',
        ]);
    }

    public function test_order_creates_order_items(): void
    {
        $user = User::factory()->create();
        $product1 = Product::factory()->create(['price' => 50.00, 'stock_quantity' => 10]);
        $product2 = Product::factory()->create(['price' => 30.00, 'stock_quantity' => 10]);

        CartItem::create(['user_id' => $user->id, 'product_id' => $product1->id, 'quantity' => 2]);
        CartItem::create(['user_id' => $user->id, 'product_id' => $product2->id, 'quantity' => 1]);

        $this->actingAs($user)->post('/orders', [
            'stripe_payment_intent_id' => 'test_payment_intent_123',
        ]);

        $order = Order::where('user_id', $user->id)->first();

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => '50.00',
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'price' => '30.00',
        ]);
    }

    public function test_order_reduces_product_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'price' => 100.00,
            'stock_quantity' => 10,
        ]);

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->actingAs($user)->post('/orders', [
            'stripe_payment_intent_id' => 'test_payment_intent_123',
        ]);

        $product->refresh();
        $this->assertEquals(7, $product->stock_quantity);
    }

    public function test_order_clears_user_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->actingAs($user)->post('/orders', [
            'stripe_payment_intent_id' => 'test_payment_intent_123',
        ]);

        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $user->id,
        ]);
    }

    public function test_cannot_create_order_with_empty_cart(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/orders', [
            'stripe_payment_intent_id' => 'test_payment_intent_123',
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('orders', [
            'user_id' => $user->id,
        ]);
    }

    public function test_cannot_create_order_if_product_out_of_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'stock_quantity' => 2,
        ]);

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 5, // More than available
        ]);

        $response = $this->actingAs($user)->post('/orders', [
            'stripe_payment_intent_id' => 'test_payment_intent_123',
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('orders', [
            'user_id' => $user->id,
        ]);
    }

    public function test_user_can_only_see_their_own_orders(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Order::factory()->create(['user_id' => $user1->id]);
        Order::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->get('/orders');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('orders.data', 1)
                ->where('orders.data.0.user_id', $user1->id)
        );
    }

    public function test_order_displays_correct_total(): void
    {
        $user = User::factory()->create();
        $product1 = Product::factory()->create(['price' => 50.00, 'stock_quantity' => 10]);
        $product2 = Product::factory()->create(['price' => 75.50, 'stock_quantity' => 10]);

        CartItem::create(['user_id' => $user->id, 'product_id' => $product1->id, 'quantity' => 2]);
        CartItem::create(['user_id' => $user->id, 'product_id' => $product2->id, 'quantity' => 1]);

        $this->actingAs($user)->post('/orders', [
            'stripe_payment_intent_id' => 'test_payment_intent_123',
        ]);

        // Total: (50 * 2) + (75.50 * 1) = 175.50
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_amount' => '175.50',
        ]);
    }

    public function test_order_requires_payment_intent_id(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)->post('/orders', []);

        $response->assertSessionHasErrors('stripe_payment_intent_id');
    }

    public function test_orders_are_displayed_in_reverse_chronological_order(): void
    {
        $user = User::factory()->create();

        $order1 = Order::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDays(2),
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($user)->get('/orders');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('orders.data.0.id', $order2->id)
                ->where('orders.data.1.id', $order1->id)
        );
    }
}
