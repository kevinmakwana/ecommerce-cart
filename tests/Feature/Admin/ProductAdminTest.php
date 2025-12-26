<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        Role::create(['name' => 'admin']);
    }

    public function test_non_admin_cannot_access_admin_products_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/products');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_products_management_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/admin/products');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Products/Index')
        );
    }

    public function test_admin_can_view_create_product_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/admin/products/create');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Products/Create')
        );
    }

    public function test_admin_can_create_product(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'New Laptop',
            'description' => 'High performance laptop',
            'price' => 1299.99,
            'stock_quantity' => 15,
        ]);

        $response->assertRedirect('/admin/products');
        $this->assertDatabaseHas('products', [
            'name' => 'New Laptop',
            'price' => '1299.99',
            'stock_quantity' => 15,
        ]);
    }

    public function test_admin_can_view_edit_product_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->get("/admin/products/{$product->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Products/Edit')
                ->where('product.id', $product->id)
        );
    }

    public function test_admin_can_update_product(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $product = Product::factory()->create([
            'name' => 'Old Name',
            'price' => 100.00,
        ]);

        $response = $this->actingAs($admin)->put("/admin/products/{$product->id}", [
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'price' => 150.00,
            'stock_quantity' => 20,
        ]);

        $response->assertRedirect('/admin/products');
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name',
            'price' => '150.00',
            'stock_quantity' => 20,
        ]);
    }

    public function test_admin_can_delete_product(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->delete("/admin/products/{$product->id}");

        $response->assertRedirect('/admin/products');
        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
    }

    public function test_product_creation_validates_name_required(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post('/admin/products', [
            'description' => 'Test',
            'price' => 100.00,
            'stock_quantity' => 10,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_product_creation_validates_price_is_numeric(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Test Product',
            'price' => 'invalid',
            'stock_quantity' => 10,
        ]);

        $response->assertSessionHasErrors('price');
    }

    public function test_product_creation_validates_price_is_positive(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Test Product',
            'price' => -10,
            'stock_quantity' => 10,
        ]);

        $response->assertSessionHasErrors('price');
    }

    public function test_product_creation_validates_stock_is_integer(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Test Product',
            'price' => 100.00,
            'stock_quantity' => 'ten',
        ]);

        $response->assertSessionHasErrors('stock_quantity');
    }

    public function test_product_creation_validates_stock_is_not_negative(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Test Product',
            'price' => 100.00,
            'stock_quantity' => -5,
        ]);

        $response->assertSessionHasErrors('stock_quantity');
    }

    public function test_admin_can_filter_products_by_search(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Product::factory()->create(['name' => 'Gaming Laptop']);
        Product::factory()->create(['name' => 'Office Desk']);

        $response = $this->actingAs($admin)->get('/admin/products?search=Laptop');

        $response->assertStatus(200);
    }

    public function test_admin_can_filter_low_stock_products(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Product::factory()->create(['name' => 'Low Stock', 'stock_quantity' => 3]);
        Product::factory()->create(['name' => 'High Stock', 'stock_quantity' => 100]);

        $response = $this->actingAs($admin)->get('/admin/products?stock=low');

        $response->assertStatus(200);
    }

    public function test_admin_can_view_out_of_stock_products(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Product::factory()->create(['name' => 'Out of Stock', 'stock_quantity' => 0]);
        Product::factory()->create(['name' => 'In Stock', 'stock_quantity' => 50]);

        $response = $this->actingAs($admin)->get('/admin/products?stock=out');

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_create_product(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/admin/products', [
            'name' => 'Test Product',
            'price' => 100.00,
            'stock_quantity' => 10,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('products', [
            'name' => 'Test Product',
        ]);
    }

    public function test_non_admin_cannot_update_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['name' => 'Original Name']);

        $response = $this->actingAs($user)->put("/admin/products/{$product->id}", [
            'name' => 'Hacked Name',
            'price' => 1.00,
            'stock_quantity' => 999,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Original Name',
        ]);
    }

    public function test_non_admin_cannot_delete_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)->delete("/admin/products/{$product->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
        ]);
    }
}
