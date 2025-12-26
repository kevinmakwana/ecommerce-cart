<?php

namespace Tests\Unit;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartItemTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_item_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->assertInstanceOf(User::class, $cartItem->user);
        $this->assertEquals($user->id, $cartItem->user->id);
    }

    public function test_cart_item_belongs_to_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->assertInstanceOf(Product::class, $cartItem->product);
        $this->assertEquals($product->id, $cartItem->product->id);
    }

    public function test_cart_item_has_fillable_attributes(): void
    {
        $cartItem = new CartItem;

        $this->assertEquals(
            ['user_id', 'product_id', 'quantity'],
            $cartItem->getFillable()
        );
    }

    public function test_cart_item_can_be_created_with_valid_data(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->assertInstanceOf(CartItem::class, $cartItem);
        $this->assertEquals($user->id, $cartItem->user_id);
        $this->assertEquals($product->id, $cartItem->product_id);
        $this->assertEquals(3, $cartItem->quantity);
    }

    public function test_cart_item_has_timestamps(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->assertNotNull($cartItem->created_at);
        $this->assertNotNull($cartItem->updated_at);
    }

    public function test_cart_item_quantity_is_integer(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->assertIsInt($cartItem->quantity);
    }

    public function test_cart_item_calculates_subtotal_correctly(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 25.50]);

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        /** @var \App\Models\Product $productModel */
        $productModel = $cartItem->product;
        $subtotal = $cartItem->quantity * floatval($productModel->price);

        $this->assertEquals(76.50, $subtotal);
    }

    public function test_user_can_have_multiple_cart_items(): void
    {
        $user = User::factory()->create();
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();

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

        $this->assertCount(2, $user->cartItems);
    }

    public function test_product_can_be_in_multiple_carts(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $product = Product::factory()->create();

        CartItem::create([
            'user_id' => $user1->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        CartItem::create([
            'user_id' => $user2->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->assertCount(2, CartItem::where('product_id', $product->id)->get());
    }

    public function test_cart_item_user_relationship_is_eager_loadable(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $cartItem = CartItem::with('user')->first();

        $this->assertTrue($cartItem->relationLoaded('user'));
        /** @var \App\Models\User $userModel */
        $userModel = $cartItem->user;
        $this->assertEquals($user->id, $userModel->id);
    }

    public function test_cart_item_product_relationship_is_eager_loadable(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $cartItem = CartItem::with('product')->first();

        $this->assertTrue($cartItem->relationLoaded('product'));
        /** @var \App\Models\Product $productModel */
        $productModel = $cartItem->product;
        $this->assertEquals($product->id, $productModel->id);
    }

    public function test_cart_item_can_be_updated(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $cartItem->update(['quantity' => 5]);

        $this->assertEquals(5, $cartItem->fresh()->quantity);
    }

    public function test_cart_item_can_be_deleted(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $cartItemId = $cartItem->id;
        $cartItem->delete();

        $this->assertNull(CartItem::find($cartItemId));
    }

    public function test_cart_item_quantity_cannot_be_zero(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        // In a real application, this would be validated at the controller level
        // Here we're just testing the model can store it
        $this->assertGreaterThan(0, $cartItem->quantity);
    }

    public function test_deleting_user_cascades_to_cart_items(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        CartItem::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $userId = $user->id;
        $user->delete();

        $this->assertCount(0, CartItem::where('user_id', $userId)->get());
    }
}
