<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $search = trim($filters['search'] ?? '');
        $dateFrom = $filters['date_from'] ?? '';
        $dateTo = $filters['date_to'] ?? '';

        $salesQuery = Order::query()
            ->where('status', 'completed')
            ->whereHas('payments', function ($query) {
                $query->where('status', 'paid');
            });

        $totalSales = (clone $salesQuery)
            ->sum('total_amount');

        $completedSales = (clone $salesQuery)
            ->count();

        $itemsSold = OrderItem::query()
            ->whereHas('order', function ($query) {
                $query
                    ->where('status', 'completed')
                    ->whereHas('payments', function ($paymentQuery) {
                        $paymentQuery->where('status', 'paid');
                    });
            })
            ->sum('quantity');

        $averageSale = $completedSales > 0
            ? $totalSales / $completedSales
            : 0;

        $sales = (clone $salesQuery)
            ->with([
                'user:id,name',
                'payments' => function ($query) {
                    $query
                        ->where('status', 'paid')
                        ->select(
                            'id',
                            'order_id',
                            'payment_method'
                        );
                },
            ])
            ->withCount('items')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(
                    'transaction_number',
                    'like',
                    '%' . $search . '%'
                );
            })
            ->when($dateFrom !== '', function ($query) use ($dateFrom) {
                $query->whereDate(
                    'completed_at',
                    '>=',
                    $dateFrom
                );
            })
            ->when($dateTo !== '', function ($query) use ($dateTo) {
                $query->whereDate(
                    'completed_at',
                    '<=',
                    $dateTo
                );
            })
            ->orderByDesc('completed_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($order) {
                return [
                    'id' => $order->id,
                    'transaction_number' =>
                        $order->transaction_number,
                    'cashier' =>
                        $order->user?->name ?? 'Unknown',
                    'items_count' =>
                        $order->items_count,
                    'payment_methods' =>
                        $order->payments
                            ->pluck('payment_method')
                            ->filter()
                            ->unique()
                            ->values()
                            ->all(),
                    'total_amount' =>
                        $order->total_amount,
                    'completed_at' =>
                        $order->completed_at?->toIso8601String(),
                    'created_at' =>
                        $order->created_at?->toIso8601String(),
                ];
            });

        return Inertia::render('Operations/Sales/Index', [
            'summary' => [
                'totalSales' => $totalSales,
                'completedSales' => $completedSales,
                'itemsSold' => $itemsSold,
                'averageSale' => $averageSale,
            ],
            'sales' => $sales,
            'filters' => [
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
