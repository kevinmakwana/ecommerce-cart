<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 18 products with low stock (1-10 units)
        Product::factory()->count(18)->lowStock()->create();

        // Create 82 products with normal stock (15-100 units)
        Product::factory()->count(82)->create();
    }
}
