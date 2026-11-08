<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'in:all,stock_in,stock_out'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $search = trim($validated['search'] ?? '');
        $type = $validated['type'] ?? 'all';
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        if (
            $dateFrom !== null &&
            $dateTo !== null &&
            $dateFrom > $dateTo
        ) {
            throw ValidationException::withMessages([
                'date_to' => 'The ending date must not be earlier than the starting date.',
            ]);
        }

        $stockHistory = StockMovement::query()
            ->with([
                'product:id,name,sku,unit_of_measure',
                'user:id,name',
                'stockInReceipt.supplier:id,name',
            ])

            // Movement type
            ->when(
                $type !== 'all',
                fn ($query) => $query->where('type', $type)
            )

            // Search
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereHas('product', function ($productQuery) use ($search) {
                        $productQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    })
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhereHas('stockInReceipt', function ($receiptQuery) use ($search) {
                        $receiptQuery->where(
                            'reference_number',
                            'like',
                            "%{$search}%"
                        );
                    });

                    // Stock Out reference
                    if (preg_match('/^SO-0*(\d+)$/i', $search, $matches)) {
                        $query->orWhere(function ($movementQuery) use ($matches) {
                            $movementQuery
                                ->where('type', 'stock_out')
                                ->where('id', (int) $matches[1]);
                        });
                    }

                    // Numeric ID
                    if (ctype_digit($search)) {
                        $query->orWhere('id', (int) $search);
                    }
                });
            })

            // Date range
            ->when(
                $dateFrom !== null || $dateTo !== null,
                function ($query) use ($dateFrom, $dateTo, $type) {
                    $query->where(function ($dateQuery) use (
                        $dateFrom,
                        $dateTo,
                        $type
                    ) {
                        // Stock In uses the actual received date.
                        if ($type !== 'stock_out') {
                            $dateQuery->whereHas(
                                'stockInReceipt',
                                function ($receiptQuery) use ($dateFrom, $dateTo) {
                                    if ($dateFrom !== null) {
                                        $receiptQuery->whereDate(
                                            'received_at',
                                            '>=',
                                            $dateFrom
                                        );
                                    }

                                    if ($dateTo !== null) {
                                        $receiptQuery->whereDate(
                                            'received_at',
                                            '<=',
                                            $dateTo
                                        );
                                    }
                                }
                            );
                        }

                        // Stock Out uses the recorded movement date.
                        if ($type !== 'stock_in') {
                            $dateQuery->orWhere(function ($movementQuery) use (
                                $dateFrom,
                                $dateTo
                            ) {
                                $movementQuery->where('type', 'stock_out');

                                if ($dateFrom !== null) {
                                    $movementQuery->whereDate(
                                        'created_at',
                                        '>=',
                                        $dateFrom
                                    );
                                }

                                if ($dateTo !== null) {
                                    $movementQuery->whereDate(
                                        'created_at',
                                        '<=',
                                        $dateTo
                                    );
                                }
                            });
                        }
                    });
                }
            )

            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inventory/StockHistory/Index', [
            'stockHistory' => $stockHistory,

            'filters' => [
                'search' => $search,
                'type' => $type,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],

            'movementTypes' => [
                [
                    'value' => 'all',
                    'label' => 'All Movements',
                ],
                [
                    'value' => 'stock_in',
                    'label' => 'Stock In',
                ],
                [
                    'value' => 'stock_out',
                    'label' => 'Stock Out',
                ],
            ],
        ]);
    }
}
