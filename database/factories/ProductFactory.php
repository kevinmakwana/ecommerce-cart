<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $products = [
            'Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'Headphones', 'Speakers',
            'Microphone', 'USB Hub', 'Docking Station', 'SSD', 'Hard Drive', 'RAM',
            'Graphics Card', 'Processor', 'Motherboard', 'Power Supply', 'Case',
            'Router', 'Switch', 'Cable', 'Adapter', 'Charger', 'Battery', 'Stand',
            'Desk Lamp', 'Chair Mat', 'Wrist Rest', 'Mouse Pad', 'Phone Stand',
            'Tablet', 'Smartwatch', 'Fitness Tracker', 'Earbuds', 'Controller',
            'Cooling Pad', 'Screen Protector', 'Stylus', 'Carrying Case', 'Backpack',
        ];

        $adjectives = ['Pro', 'Ultra', 'Premium', 'Wireless', 'RGB', 'Mechanical', 'Ergonomic',
            'Portable', 'Compact', 'HD', '4K', 'Gaming', 'Professional', 'Business'];

        $brands = ['TechPro', 'EliteGear', 'MaxTech', 'ProDevice', 'SmartTech', 'PrimeTech',
            'NextGen', 'FusionTech', 'CoreDevice', 'SwiftTech'];

        $product = fake()->randomElement($products);
        $adjective = fake()->randomElement($adjectives);
        $brand = fake()->randomElement($brands);

        return [
            'name' => "{$brand} {$adjective} {$product}",
            'description' => fake()->sentence(12),
            'price' => fake()->randomFloat(2, 9.99, 1999.99),
            'stock_quantity' => fake()->numberBetween(15, 100),
        ];
    }

    /**
     * Indicate that the product has low stock.
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => fake()->numberBetween(1, 10),
        ]);
    }
}
