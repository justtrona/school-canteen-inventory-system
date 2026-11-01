<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Inertia\Inertia;
use Inertia\Response;

class InventoryDashboardController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 10;

    public function index(): Response
    {
        $statistics = [
            'total_products' => Product::whereNull('archived_at')
                ->count(),

            'in_stock' => Product::whereNull('archived_at')
                ->where('quantity', '>', self::LOW_STOCK_THRESHOLD)
                ->count(),

            'low_stock' => Product::whereNull('archived_at')
                ->whereBetween('quantity', [1, self::LOW_STOCK_THRESHOLD])
                ->count(),

            'out_of_stock' => Product::whereNull('archived_at')
                ->where('quantity', 0)
                ->count(),

            'total_stock_units' => Product::whereNull('archived_at')
                ->sum('quantity'),
        ];

        $recentMovements = StockMovement::with([
                'product:id,name,sku',
                'user:id,name',
            ])
            ->latest()
            ->limit(5)
            ->get([
                'id',
                'product_id',
                'user_id',
                'type',
                'quantity_change',
                'quantity_after',
                'created_at',
            ]);

        return Inertia::render('Dashboard', [
            'statistics' => $statistics,
            'recentMovements' => $recentMovements,
        ]);
    }
}
