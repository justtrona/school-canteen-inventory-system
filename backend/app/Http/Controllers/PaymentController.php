<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');

        $allowedStatuses = [
            'all',
            'pending',
            'paid',
            'refunded',
            'voided',
        ];

        if (!in_array($status, $allowedStatuses, true)) {
            $status = 'all';
        }

        $summary = [
            'totalCollected' => Payment::query()
                ->where('status', 'paid')
                ->sum('amount'),

            'paidPayments' => Payment::query()
                ->where('status', 'paid')
                ->count(),

            'pendingPayments' => Payment::query()
                ->where('status', 'pending')
                ->count(),

            'reversedPayments' => Payment::query()
                ->whereIn('status', ['refunded', 'voided'])
                ->count(),
        ];

        $payments = Payment::query()
            ->with([
                'order:id,transaction_number',
                'receivedBy:id,name',
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where(
                        'reference_number',
                        'like',
                        '%' . $search . '%'
                    )->orWhereHas('order', function ($orderQuery) use ($search) {
                        $orderQuery->where(
                            'transaction_number',
                            'like',
                            '%' . $search . '%'
                        );
                    });
                });
            })
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($payment) {
                return [
                    'id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'transaction_number' =>
                        $payment->order?->transaction_number ?? '—',
                    'received_by' =>
                        $payment->receivedBy?->name ?? '—',
                    'payment_method' => $payment->payment_method,
                    'amount' => $payment->amount,
                    'amount_received' => $payment->amount_received,
                    'change_amount' => $payment->change_amount,
                    'reference_number' => $payment->reference_number,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at?->toIso8601String(),
                    'created_at' => $payment->created_at?->toIso8601String(),
                ];
            });

        return Inertia::render('Operations/Payments/Index', [
            'summary' => $summary,
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }
}
