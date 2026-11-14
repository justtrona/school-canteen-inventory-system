<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class POSController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');

        $allowedStatuses = [
            'all',
            'pending',
            'completed',
            'cancelled',
            'voided',
        ];

        if (!in_array($status, $allowedStatuses, true)) {
            $status = 'all';
        }

        $today = Carbon::today();

        $completedOrders = Order::query()
            ->where('status', 'completed')
            ->whereDate('completed_at', $today);

        $totalSales = (float) (clone $completedOrders)
            ->sum('total_amount');

        $completedTransactions = (clone $completedOrders)
            ->count();

        $averageTransaction = $completedTransactions > 0
            ? round($totalSales / $completedTransactions, 2)
            : 0;

        $voidedTransactions = Order::query()
            ->where('status', 'voided')
            ->whereDate('voided_at', $today)
            ->count();

        $transactions = Order::query()
            ->with([
                'user:id,name',
                'payments' => function ($query) {
                    $query->select(
                        'id',
                        'order_id',
                        'payment_method',
                        'status',
                        'paid_at'
                    )->orderByDesc('id');
                },
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(
                    'transaction_number',
                    'like',
                    '%' . $search . '%'
                );
            })
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($order) {
                $payment = $order->payments->first(
                    fn ($payment) => $payment->status === 'paid'
                ) ?? $order->payments->first();

                return [
                    'id' => $order->id,
                    'transaction_number' => $order->transaction_number,
                    'cashier' => $order->user?->name ?? 'Unknown',
                    'created_at' => $order->created_at?->toIso8601String(),
                    'total_amount' => $order->total_amount,
                    'payment_method' => $payment?->payment_method,
                    'status' => $order->status,
                ];
            });

        return Inertia::render('Operations/POS/Index', [
            'summary' => [
                'totalSales' => $totalSales,
                'completedTransactions' => $completedTransactions,
                'averageTransaction' => $averageTransaction,
                'voidedTransactions' => $voidedTransactions,
            ],
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }
}
