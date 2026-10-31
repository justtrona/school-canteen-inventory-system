<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'transaction_number',
        'user_id',
        'subtotal',
        'discount_amount',
        'total_amount',
        'status',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'completed_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    // Admin or Superadmin who created the order.
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Products included in the order.
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Payments associated with the order.
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // Superadmin who voided the transaction.
    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }
}