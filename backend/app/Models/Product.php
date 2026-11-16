<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    public const UNITS = [
        'pcs',
        'bottle',
        'pack',
        'box',
        'kg',
        'g',
        'L',
        'mL',
    ];

    protected $fillable = [
        'category_id',
        'sku',
        'name',
        'description',
        'purchase_cost',
        'price',
        'unit_of_measure',
        'reorder_level',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'purchase_cost' => 'decimal:2',
            'price' => 'decimal:2',
            'quantity' => 'decimal:3',
            'reorder_level' => 'decimal:3',
            'is_active' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(
            Supplier::class,
            'product_suppliers'
        )->withTimestamps();
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->reorder_level;
    }

    public function hasStock(): bool
    {
        return $this->quantity > 0;
    }

    public function isAvailableForSale(): bool
    {
        return $this->is_active
            && $this->archived_at === null
            && $this->hasStock();
    }
}
