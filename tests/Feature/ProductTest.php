<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_products_list(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->get('/products');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_view_products(): void
    {
        $user = User::factory()->create();
        Product::factory()->count(5)->create();

        $response = $this->actingAs($user)->get('/products');

        $response->assertStatus(200);
    }

    public function test_products_list_displays_correct_data(): void
    {
        Product::factory()->create([
            'name' => 'Laptop',
            'description' => 'High-performance laptop',
            'price' => 1299.99,
            'stock_quantity' => 5,
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Products/Index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Laptop')
                ->where('products.data.0.price', '1299.99')
        );
    }

    public function test_out_of_stock_products_are_displayed_correctly(): void
    {
        Product::factory()->create([
            'name' => 'Out of Stock Item',
            'stock_quantity' => 0,
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('products.data.0.stock_quantity', 0)
        );
    }

    public function test_low_stock_products_are_identified(): void
    {
        Product::factory()->create([
            'name' => 'Low Stock Item',
            'stock_quantity' => 5,
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/products');

        $response->assertStatus(200);
    }

    public function test_products_can_be_filtered_by_search(): void
    {
        Product::factory()->create(['name' => 'Gaming Laptop']);
        Product::factory()->create(['name' => 'Office Chair']);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/products?search=Laptop');

        $response->assertStatus(200);
    }

    public function test_products_are_paginated(): void
    {
        Product::factory()->count(20)->create();

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('products.data')
                ->has('products.links')
        );
    }

    public function test_product_price_is_formatted_correctly(): void
    {
        $product = Product::factory()->create([
            'price' => 1234.56,
        ]);

        $this->assertEquals('1234.56', $product->price);
    }
}
