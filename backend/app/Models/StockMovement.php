<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id',
        'user_id',
        'type',
        'quantity_change',
        'quantity_before',
        'quantity_after',
        'reference_type',
        'reference_id',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'quantity_change' => 'integer',
            'quantity_before' => 'integer',
            'quantity_after' => 'integer',
            'reference_id' => 'integer',
        ];
    }

    // Product affected by the inventory movement.
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Admin or Superadmin responsible for the movement.
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}