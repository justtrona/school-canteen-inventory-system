<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockInReceipt;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockInController extends Controller
{
    private function toCents(string $amount): int
    {
        $parts = explode('.', $amount, 2);

        $whole = (int) $parts[0];

        $fraction = str_pad(
            $parts[1] ?? '',
            2,
            '0',
            STR_PAD_RIGHT
        );

        return ($whole * 100) + (int) $fraction;
    }

    private function toThousandths(string $quantity): int
    {
        $parts = explode('.', $quantity, 2);

        $whole = (int) $parts[0];

        $fraction = str_pad(
            $parts[1] ?? '',
            3,
            '0',
            STR_PAD_RIGHT
        );

        return ($whole * 1000) + (int) $fraction;
    }

    private function formatQuantity(int $quantity): string
    {
        return number_format(
            $quantity / 1000,
            3,
            '.',
            ''
        );
    }

    public function index(Request $request): Response
    {
        $search = trim(
            (string) $request->query('search', '')
        );

        $stockIns = StockMovement::query()
            ->with([
                'product:id,sku,name,unit_of_measure',
                'stockInReceipt',
                'stockInReceipt.supplier',
                'user:id,name',
            ])
            ->where('type', 'in')
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas(
                    'product',
                    function ($productQuery) use ($search) {
                        $productQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    }
                );
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $products = Product::query()
            ->whereNull('archived_at')
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'sku',
                'name',
                'price',
                'quantity',
                'unit_of_measure',
            ]);

        $suppliers = Supplier::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/StockIn/Index', [
            'stockIns' => $stockIns,
            'products' => $products,
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'reference_number' => trim(
                (string) $request->input(
                    'reference_number',
                    ''
                )
            ),
            'notes' => trim(
                (string) $request->input('notes', '')
            ) ?: null,
        ]);

        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],
            'supplier_id' => [
                'nullable',
                'integer',
                'exists:suppliers,id',
            ],
            'quantity' => [
                'required',
                'numeric',
                'gt:0',
                'max:999999999.999',
                'decimal:0,3',
            ],
            'unit_cost' => [
                'required',
                'numeric',
                'gt:0',
                'max:99999999.99',
                'decimal:0,2',
            ],
            'reference_number' => [
                'nullable',
                'string',
                'max:100',
            ],
            'received_at' => [
                'required',
                'date',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ], [
            'product_id.required' =>
                'Please select a product.',
            'product_id.exists' =>
                'The selected product does not exist.',
            'quantity.required' =>
                'Please enter the received quantity.',
            'quantity.gt' =>
                'Received quantity must be greater than zero.',
            'quantity.decimal' =>
                'Quantity can have up to 3 decimal places.',
            'unit_cost.required' =>
                'Please enter the supplier unit cost.',
            'unit_cost.gt' =>
                'Unit cost must be greater than zero.',
            'unit_cost.decimal' =>
                'Unit cost can have up to 2 decimal places.',
        ]);

        DB::transaction(function () use ($validated) {
            $product = Product::query()
                ->whereKey($validated['product_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (
                $product->archived_at !== null ||
                !$product->is_active
            ) {
                throw ValidationException::withMessages([
                    'product_id' =>
                        'This product is not available for Stock In.',
                ]);
            }

            $unitCostCents = $this->toCents(
                (string) $validated['unit_cost']
            );

            $sellingPriceCents = $this->toCents(
                (string) $product->price
            );

            if ($unitCostCents > $sellingPriceCents) {
                throw ValidationException::withMessages([
                    'unit_cost' =>
                        'Supplier unit cost cannot exceed the product selling price of ₱' .
                        number_format(
                            $sellingPriceCents / 100,
                            2
                        ) .
                        '. Please update the product selling price first.',
                ]);
            }

            if (
                isset($validated['supplier_id']) &&
                $validated['supplier_id'] !== null
            ) {
                $supplier = Supplier::query()
                    ->whereKey($validated['supplier_id'])
                    ->first();

                if (!$supplier || !$supplier->is_active) {
                    throw ValidationException::withMessages([
                        'supplier_id' =>
                            'Please select an active supplier.',
                    ]);
                }
            }

            $quantityBefore = $this->toThousandths(
                (string) $product->quantity
            );

            $quantityChange = $this->toThousandths(
                (string) $validated['quantity']
            );

            $quantityAfter =
                $quantityBefore + $quantityChange;

            if ($quantityAfter > 999999999999) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        'Stock In would exceed the maximum inventory quantity.',
                ]);
            }

            if (
                $quantityChange >
                intdiv(PHP_INT_MAX - 500, $unitCostCents)
            ) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        'The total stock cost exceeds the supported limit.',
                ]);
            }

            $totalCostNumerator =
                $quantityChange * $unitCostCents;

            $totalCostCents = intdiv(
                $totalCostNumerator + 500,
                1000
            );

            if ($totalCostCents > 999999999999999999) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        'The total stock cost exceeds the maximum supported amount.',
                ]);
            }

            $totalCost = number_format(
                $totalCostCents / 100,
                2,
                '.',
                ''
            );

            $movement = new StockMovement();

            $movement->product_id = $product->id;
            $movement->user_id = auth()->id();
            $movement->type = 'in';

            $movement->quantity_change =
                $this->formatQuantity($quantityChange);

            $movement->quantity_before =
                $this->formatQuantity($quantityBefore);

            $movement->quantity_after =
                $this->formatQuantity($quantityAfter);

            $movement->reason =
                $validated['notes'] ?? null;

            $movement->save();

            $referenceNumber = trim(
                (string) (
                    $validated['reference_number'] ?? ''
                )
            );

            if ($referenceNumber === '') {
                $referenceNumber =
                    'SI-' .
                    now()->format('YmdHis') .
                    '-' .
                    $movement->id;
            }

            $receipt = new StockInReceipt();

            $receipt->stock_movement_id =
                $movement->id;

            $receipt->supplier_id =
                $validated['supplier_id'] ?? null;

            $receipt->reference_number =
                $referenceNumber;

            $receipt->received_at =
                $validated['received_at'];

            $receipt->unit_cost =
                number_format(
                    $unitCostCents / 100,
                    2,
                    '.',
                    ''
                );

            $receipt->total_cost =
                $totalCost;

            $receipt->save();

            $product->quantity =
                $this->formatQuantity($quantityAfter);

            $product->save();
        }, 3);

        return redirect()
            ->route('inventory.stock-in.index')
            ->with(
                'success',
                'Stock In recorded successfully.'
            );
    }
}
