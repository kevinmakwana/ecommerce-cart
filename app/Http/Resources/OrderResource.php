<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => '#' . str_pad((string) $this->id, 6, '0', STR_PAD_LEFT),
            'user_id' => $this->user_id,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'order_items' => $this->orderItems->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name ?? 'Product not found',
                'product_image' => $item->product->image_url ?? null,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'total_price' => floatval($item->price) * $item->quantity,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,

                // Product relationship (if available)
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'description' => $item->product->description,
                    'price' => $item->product->price,
                    'image_url' => $item->product->image_url,
                ] : null,
            ]),
        ];
    }
}
