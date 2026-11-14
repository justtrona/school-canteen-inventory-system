<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
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

        $counts = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $statusCounts = [
            'all' => (int) $counts->sum(),
            'pending' => (int) ($counts['pending'] ?? 0),
            'completed' => (int) ($counts['completed'] ?? 0),
            'cancelled' => (int) ($counts['cancelled'] ?? 0),
            'voided' => (int) ($counts['voided'] ?? 0),
        ];

        $orders = Order::query()
            ->with('user:id,name')
            ->withCount('items')
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
                return [
                    'id' => $order->id,
                    'transaction_number' => $order->transaction_number,
                    'created_by' => $order->user?->name ?? 'Unknown',
                    'items_count' => $order->items_count,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at?->toIso8601String(),
                ];
            });

        return Inertia::render('Operations/Orders/Index', [
            'orders' => $orders,
            'statusCounts' => $statusCounts,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load([
            'user:id,name',
            'items',
            'payments.receivedBy:id,name',
            'voidedBy:id,name',
        ]);

        $items = $order->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ];
        });

        $payments = $order->payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'payment_method' => $payment->payment_method,
                'amount' => $payment->amount,
                'amount_received' => $payment->amount_received,
                'change_amount' => $payment->change_amount,
                'reference_number' => $payment->reference_number,
                'status' => $payment->status,
                'received_by' => $payment->receivedBy?->name,
                'paid_at' => $payment->paid_at?->toIso8601String(),
                'notes' => $payment->notes,
            ];
        });

        return response()->json([
            'order' => [
                'id' => $order->id,
                'transaction_number' => $order->transaction_number,
                'created_by' => $order->user?->name ?? 'Unknown',
                'status' => $order->status,
                'created_at' => $order->created_at?->toIso8601String(),
                'completed_at' => $order->completed_at?->toIso8601String(),
                'subtotal' => $order->subtotal,
                'discount_amount' => $order->discount_amount,
                'total_amount' => $order->total_amount,
                'notes' => $order->notes,
                'void_reason' => $order->void_reason,
                'voided_at' => $order->voided_at?->toIso8601String(),
                'voided_by' => $order->voidedBy?->name,
                'items' => $items,
                'payments' => $payments,
            ],
        ]);
    }
}
