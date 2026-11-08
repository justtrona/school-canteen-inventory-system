<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockInReceipt extends Model
{
    protected $fillable = [
        'stock_movement_id',
        'supplier_id',
        'reference_number',
        'received_at',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'date:Y-m-d',
        ];
    }

    public function stockMovement(): BelongsTo
    {
        return $this->belongsTo(
            StockMovement::class,
            'stock_movement_id'
        );
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
