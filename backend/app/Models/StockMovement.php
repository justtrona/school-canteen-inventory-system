<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
            'quantity_change' => 'decimal:3',
            'quantity_before' => 'decimal:3',
            'quantity_after' => 'decimal:3',
            'reference_id' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function stockInReceipt(): HasOne
    {
        return $this->hasOne(StockInReceipt::class);
    }
}