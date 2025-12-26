<?php

namespace Tests\Unit;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_has_fillable_attributes(): void
    {
        $product = new Product;

        $this->assertEquals(
            ['name', 'description', 'price', 'stock_quantity'],
            $product->getFillable()
        );
    }

    public function test_product_price_is_cast_to_decimal(): void
    {
        $product = Product::factory()->create([
            'price' => 99.99,
        ]);

        $this->assertIsString($product->price);
        $this->assertEquals('99.99', $product->price);
    }

    public function test_product_can_be_created_with_valid_data(): void
    {
        $product = Product::create([
            'name' => 'Test Product',
            'description' => 'Test Description',
            'price' => 149.99,
            'stock_quantity' => 20,
        ]);

        $this->assertInstanceOf(Product::class, $product);
        $this->assertEquals('Test Product', $product->name);
        $this->assertEquals('149.99', $product->price);
        $this->assertEquals(20, $product->stock_quantity);
    }

    public function test_product_has_timestamps(): void
    {
        $product = Product::factory()->create();

        $this->assertNotNull($product->created_at);
        $this->assertNotNull($product->updated_at);
    }

    public function test_product_price_precision(): void
    {
        $product = Product::factory()->create([
            'price' => 99.999, // 3 decimal places
        ]);

        $product->refresh();

        // Should be rounded to 2 decimal places
        $this->assertEquals('100.00', $product->price);
    }

    public function test_product_stock_quantity_is_integer(): void
    {
        $product = Product::factory()->create([
            'stock_quantity' => 15,
        ]);

        $this->assertIsInt($product->stock_quantity);
    }

    public function test_product_can_check_if_in_stock(): void
    {
        $inStockProduct = Product::factory()->create(['stock_quantity' => 10]);
        $outOfStockProduct = Product::factory()->create(['stock_quantity' => 0]);

        $this->assertTrue($inStockProduct->stock_quantity > 0);
        $this->assertFalse($outOfStockProduct->stock_quantity > 0);
    }

    public function test_product_can_check_if_low_stock(): void
    {
        $lowStockProduct = Product::factory()->create(['stock_quantity' => 5]);
        $normalStockProduct = Product::factory()->create(['stock_quantity' => 50]);

        $lowStockThreshold = 10;

        $this->assertTrue($lowStockProduct->stock_quantity < $lowStockThreshold);
        $this->assertFalse($normalStockProduct->stock_quantity < $lowStockThreshold);
    }

    public function test_product_name_is_required(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Product::create([
            'description' => 'Test',
            'price' => 100.00,
            'stock_quantity' => 10,
        ]);
    }

    public function test_product_can_have_zero_stock(): void
    {
        $product = Product::factory()->create([
            'stock_quantity' => 0,
        ]);

        $this->assertEquals(0, $product->stock_quantity);
    }

    public function test_product_description_can_be_null(): void
    {
        $product = Product::create([
            'name' => 'Test Product',
            'price' => 50.00,
            'stock_quantity' => 10,
        ]);

        $this->assertNull($product->description);
    }

    public function test_product_factory_creates_valid_product(): void
    {
        $product = Product::factory()->create();

        $this->assertNotNull($product->name);
        $this->assertNotNull($product->price);
        $this->assertNotNull($product->stock_quantity);
        $this->assertGreaterThan(0, floatval($product->price));
        $this->assertGreaterThanOrEqual(0, $product->stock_quantity);
    }
}
