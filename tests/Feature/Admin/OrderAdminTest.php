<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrderAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        Role::create(['name' => 'admin']);
    }

    public function test_non_admin_cannot_access_admin_orders_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/orders');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_orders_management_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/admin/orders');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Orders/Index')
        );
    }

    public function test_admin_can_view_all_orders(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Order::factory()->create(['user_id' => $user1->id]);
        Order::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($admin)->get('/admin/orders');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('orders.data', 2)
        );
    }

    public function test_admin_can_view_single_order_details(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin)->get("/admin/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Orders/Show')
                ->where('order.id', $order->id)
        );
    }

    public function test_admin_can_update_order_status(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->patch("/admin/orders/{$order->id}", [
            'status' => 'completed',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'completed',
        ]);
    }

    public function test_admin_can_filter_orders_by_status(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Order::factory()->create(['status' => 'pending']);
        Order::factory()->create(['status' => 'completed']);

        $response = $this->actingAs($admin)->get('/admin/orders?status=pending');

        $response->assertStatus(200);
    }

    public function test_admin_can_search_orders_by_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $user = User::factory()->create(['name' => 'John Doe']);
        Order::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin)->get('/admin/orders?search=John');

        $response->assertStatus(200);
    }

    public function test_order_details_show_order_items(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $order = Order::factory()->create();
        $product1 = Product::factory()->create(['name' => 'Product 1']);
        $product2 = Product::factory()->create(['name' => 'Product 2']);

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

        $response = $this->actingAs($admin)->get("/admin/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('order.order_items', 2)
        );
    }

    public function test_order_details_show_user_information(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $user = User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);
        $order = Order::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin)->get("/admin/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('order.user.name', 'Jane Smith')
                ->where('order.user.email', 'jane@example.com')
        );
    }

    public function test_non_admin_cannot_view_orders_list(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/orders');

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_view_order_details(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create();

        $response = $this->actingAs($user)->get("/admin/orders/{$order->id}");

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_update_order_status(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($user)->patch("/admin/orders/{$order->id}", [
            'status' => 'completed',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_see_order_totals(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $order = Order::factory()->create(['total_amount' => 250.50]);

        $response = $this->actingAs($admin)->get("/admin/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('order.total_amount', '250.50')
        );
    }

    public function test_orders_are_paginated_on_admin_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Order::factory()->count(20)->create();

        $response = $this->actingAs($admin)->get('/admin/orders');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('orders.data')
                ->has('orders.links')
        );
    }

    public function test_admin_can_filter_orders_by_date_range(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Order::factory()->create(['created_at' => now()->subDays(10)]);
        Order::factory()->create(['created_at' => now()->subDay()]);

        $response = $this->actingAs($admin)->get('/admin/orders?date_from=' . now()->subDays(2)->format('Y-m-d'));

        $response->assertStatus(200);
    }

    public function test_order_status_validation(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->patch("/admin/orders/{$order->id}", [
            'status' => 'invalid_status',
        ]);

        $response->assertSessionHasErrors('status');
    }

    public function test_admin_dashboard_shows_order_statistics(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Order::factory()->count(5)->create(['status' => 'completed']);
        Order::factory()->count(3)->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->get('/admin/orders');

        $response->assertStatus(200);
    }
}
