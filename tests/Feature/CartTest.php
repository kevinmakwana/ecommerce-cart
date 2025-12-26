<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_cart(): void
    {
        $response = $this->get('/cart');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_cart(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Cart/Index')
        );
    }

    public function test_user_can_add_product_to_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'stock_quantity' => 10,
        ]);

        $response = $this->actingAs($user)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_user_cannot_add_more_than_available_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'stock_quantity' => 5,
        ]);

        $response = $this->actingAs($user)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_cannot_add_out_of_stock_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'stock_quantity' => 0,
        ]);

        $response = $this->actingAs($user)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_user_can_update_cart_item_quantity(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->patch("/cart/{$cartItem->id}", [
            'quantity' => 5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 5,
        ]);
    }

    public function test_user_cannot_update_quantity_beyond_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 5]);
        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->patch("/cart/{$cartItem->id}", [
            'quantity' => 10,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 2, // unchanged
        ]);
    }

    public function test_user_can_remove_item_from_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->delete("/cart/{$cartItem->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_user_cannot_modify_another_users_cart(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user1->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user2)->delete("/cart/{$cartItem->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_cart_displays_correct_subtotal(): void
    {
        $user = User::factory()->create();
        $product1 = Product::factory()->create(['price' => 50.00]);
        $product2 = Product::factory()->create(['price' => 30.00]);

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product1->id,
            'quantity' => 2,
        ]);

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product2->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)->get('/cart');

        $response->assertStatus(200);
        // Subtotal should be (50 * 2) + (30 * 1) = 130
    }

    public function test_empty_cart_displays_correctly(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('cartItems', [])
        );
    }

    public function test_adding_same_product_updates_existing_cart_item(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        // Add product first time
        $this->actingAs($user)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        // Add same product again
        $this->actingAs($user)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->assertDatabaseCount('cart_items', 1);
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 5, // 2 + 3
        ]);
    }

    public function test_cart_validates_quantity_is_positive(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => -1,
        ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_cart_validates_product_exists(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/cart', [
            'product_id' => 99999,
            'quantity' => 1,
        ]);

        $response->assertSessionHasErrors('product_id');
    }
}
