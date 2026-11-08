<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    // ========================================
    // INVENTORY UNIT OPTIONS
    // ========================================

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

    // ========================================
    // FILLABLE FIELDS
    // ========================================

    protected $fillable = [
        'category_id',
        'sku',
        'name',
        'description',
        'price',
        'unit_of_measure',
        'reorder_level',
        'is_active',
    ];

    // ========================================
    // ATTRIBUTE CASTS
    // ========================================

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'decimal:3',
            'reorder_level' => 'decimal:3',
            'is_active' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    // ========================================
    // CATEGORY RELATIONSHIP
    // ========================================

    // Each product belongs to one category.

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // ========================================
    // SUPPLIERS RELATIONSHIP
    // ========================================

    // Each product can have multiple suppliers.

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(
            Supplier::class,
            'product_suppliers'
        )->withTimestamps();
    }

    // ========================================
    // STOCK MOVEMENTS RELATIONSHIP
    // ========================================

    // Each product can have multiple stock movements.

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    // ========================================
    // ORDER ITEMS RELATIONSHIP
    // ========================================

    // Each product can appear in multiple order items.

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ========================================
    // INVENTORY HELPERS
    // ========================================

    // Check whether the product is running low on stock.

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->reorder_level;
    }

    // Check whether the product has available stock.

    public function hasStock(): bool
    {
        return $this->quantity > 0;
    }

    // Check whether the product is available for sale.

    public function isAvailableForSale(): bool
    {
        return $this->is_active
            && $this->archived_at === null
            && $this->hasStock();
    }
}
