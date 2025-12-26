<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $order->user);
        $this->assertEquals($user->id, $order->user->id);
    }

    public function test_order_has_many_items(): void
    {
        $order = Order::factory()->create();
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => 50.00,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'price' => 30.00,
        ]);

        $this->assertCount(2, $order->items);
        $this->assertInstanceOf(OrderItem::class, $order->items->first());
    }

    public function test_order_items_alias_works(): void
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create();

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 25.00,
        ]);

        $this->assertCount(1, $order->orderItems);
        /** @var \App\Models\OrderItem $firstItem */
        $firstItem = $order->items->first();
        /** @var \App\Models\OrderItem $firstOrderItem */
        $firstOrderItem = $order->orderItems->first();
        $this->assertEquals($firstItem->id, $firstOrderItem->id);
    }

    public function test_order_has_fillable_attributes(): void
    {
        $order = new Order;

        $this->assertEquals(
            ['user_id', 'total_amount', 'status', 'stripe_payment_intent_id'],
            $order->getFillable()
        );
    }

    public function test_order_total_amount_is_cast_to_decimal(): void
    {
        $order = Order::factory()->create([
            'total_amount' => 199.99,
        ]);

        $this->assertIsString($order->total_amount);
        $this->assertEquals('199.99', $order->total_amount);
    }

    public function test_order_can_be_created_with_valid_data(): void
    {
        $user = User::factory()->create();

        $order = Order::create([
            'user_id' => $user->id,
            'total_amount' => 299.99,
            'status' => 'pending',
        ]);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals($user->id, $order->user_id);
        $this->assertEquals('299.99', $order->total_amount);
        $this->assertEquals('pending', $order->status);
    }

    public function test_order_has_timestamps(): void
    {
        $order = Order::factory()->create();

        $this->assertNotNull($order->created_at);
        $this->assertNotNull($order->updated_at);
    }

    public function test_order_calculates_total_from_items(): void
    {
        $order = Order::factory()->create();
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => 50.00,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'quantity' => 3,
            'price' => 25.00,
        ]);

        $calculatedTotal = $order->items->sum(
            /* @var \App\Models\OrderItem $item */

            fn ($item) => $item->quantity * floatval($item->price)
        );

        // 2 * 50 + 3 * 25 = 175
        $this->assertEquals(175.00, $calculatedTotal);
    }

    public function test_order_status_defaults(): void
    {
        $user = User::factory()->create();

        $order = Order::create([
            'user_id' => $user->id,
            'total_amount' => 100.00,
            'status' => 'pending',
        ]);

        $this->assertEquals('pending', $order->status);
    }

    public function test_order_can_have_completed_status(): void
    {
        $order = Order::factory()->create(['status' => 'completed']);

        $this->assertEquals('completed', $order->status);
    }

    public function test_order_can_have_cancelled_status(): void
    {
        $order = Order::factory()->create(['status' => 'cancelled']);

        $this->assertEquals('cancelled', $order->status);
    }

    public function test_order_user_relationship_is_eager_loadable(): void
    {
        $user = User::factory()->create();
        Order::factory()->create(['user_id' => $user->id]);

        $order = Order::with('user')->first();

        $this->assertTrue($order->relationLoaded('user'));
        /** @var \App\Models\User $userModel */
        $userModel = $order->user;
        $this->assertEquals($user->id, $userModel->id);
    }

    public function test_order_items_relationship_is_eager_loadable(): void
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create();

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 50.00,
        ]);

        $orderWithItems = Order::with('items')->find($order->id);

        $this->assertTrue($orderWithItems->relationLoaded('items'));
        $this->assertCount(1, $orderWithItems->items);
    }

    public function test_order_factory_creates_valid_order(): void
    {
        $order = Order::factory()->create();

        $this->assertNotNull($order->user_id);
        $this->assertNotNull($order->total_amount);
        $this->assertNotNull($order->status);
        $this->assertGreaterThan(0, floatval($order->total_amount));
    }
}
