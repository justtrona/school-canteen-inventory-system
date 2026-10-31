<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    // ========================================
    // FILLABLE FIELDS
    // ========================================

    protected $fillable = [
        'category_id',
        'sku',
        'name',
        'description',
        'price',
        'is_active',
    ];

    // ========================================
    // ATTRIBUTE CASTS
    // ========================================

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'is_active' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    // ========================================
    // CATEGORY RELATIONSHIP
    // ========================================

    // Each product belongs to a category.
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

    // Each product can have multiple inventory movements.
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
}