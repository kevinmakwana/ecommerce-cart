<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $total_amount
 * @property string $status
 * @property string|null $stripe_payment_intent_id
 * @property-read User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrderItem> $items
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrderItem> $orderItems
 */
class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_amount',
        'status',
        'stripe_payment_intent_id',
    ];

    /**
     * @return BelongsTo<User, Order>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasMany<OrderItem>
     */
    public function orderItems(): HasMany
    {
        return $this->items();
    }

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
        ];
    }
}
