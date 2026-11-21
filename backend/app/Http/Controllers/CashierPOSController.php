<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashierPOSController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->where('is_active', true)
            ->whereNull('archived_at')
            ->where('price', '>', 0)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'sku',
                'category_id',
                'price',
                'quantity',
                'unit_of_measure',
            ]);

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render('Cashier/POS/Index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
