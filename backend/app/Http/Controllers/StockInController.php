<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockInReceipt;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockInController extends Controller
{
    private const COUNT_UNITS = [
        'pcs',
        'bottle',
        'pack',
        'box',
    ];

    private const MAX_QUANTITY_MILLI = 999999999999;

    // ========================================
    // STOCK IN LIST
    // ========================================

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $supplierId = $request->query('supplier');

        $stockIns = StockMovement::query()
            ->where('type', 'stock_in')
            ->with([
                'product:id,name,sku,unit_of_measure',
                'user:id,name',
                'stockInReceipt.supplier:id,name',
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereHas('product', function ($productQuery) use ($search) {
                        $productQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    })->orWhereHas('stockInReceipt', function ($receiptQuery) use ($search) {
                        $receiptQuery->where(
                            'reference_number',
                            'like',
                            "%{$search}%"
                        );
                    });
                });
            })
            ->when(
                filled($supplierId),
                fn ($query) => $query->whereHas(
                    'stockInReceipt',
                    fn ($receiptQuery) =>
                        $receiptQuery->where('supplier_id', $supplierId)
                )
            )
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $products = Product::query()
            ->whereNull('archived_at')
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'sku',
                'quantity',
                'unit_of_measure',
            ]);

        $suppliers = Supplier::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'is_active',
            ]);

        return Inertia::render('Inventory/StockIn/Index', [
            'stockIns' => $stockIns,
            'products' => $products,
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $search,
                'supplier' => $supplierId,
            ],
        ]);
    }

    // ========================================
    // DECIMAL HELPERS
    // ========================================

    private function toMilli(string $value): int
    {
        $parts = explode('.', $value, 2);

        $whole = (int) $parts[0];

        $fraction = str_pad(
            $parts[1] ?? '',
            3,
            '0',
            STR_PAD_RIGHT
        );

        return ($whole * 1000) + (int) $fraction;
    }

    private function fromMilli(int $value): string
    {
        $whole = intdiv($value, 1000);
        $fraction = $value % 1000;

        return $whole . '.' . str_pad(
            (string) $fraction,
            3,
            '0',
            STR_PAD_LEFT
        );
    }

    // ========================================
    // SAVE STOCK IN
    // ========================================

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id'),
            ],

            'supplier_id' => [
                'required',
                'integer',
                Rule::exists('suppliers', 'id')
                    ->where('is_active', true),
            ],

            'quantity' => [
                'required',
                'numeric',
                'gt:0',
                'max:999999999.999',
                'decimal:0,3',
            ],

            'received_at' => [
                'required',
                'date_format:Y-m-d',
                'before_or_equal:today',
            ],

            'reason' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $quantityText = trim(
            (string) $request->input('quantity', '')
        );

        if (
            !preg_match(
                '/^(?:0|[1-9][0-9]{0,8})(?:\.[0-9]{1,3})?$/',
                $quantityText
            )
        ) {
            throw ValidationException::withMessages([
                'quantity' =>
                    'Enter a valid quantity with up to 3 decimal places.',
            ]);
        }

        $receivedMilli = $this->toMilli($quantityText);

        if ($receivedMilli <= 0) {
            throw ValidationException::withMessages([
                'quantity' =>
                    'Received quantity must be greater than zero.',
            ]);
        }

        DB::transaction(function () use (
            $validated,
            $receivedMilli
        ) {
            // Lock product to protect its current stock.

            $product = Product::query()
                ->whereKey($validated['product_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (!$product->is_active || $product->archived_at !== null) {
                throw ValidationException::withMessages([
                    'product_id' =>
                        'Please select an active, non-archived product.',
                ]);
            }

            // Confirm the selected supplier is still active.

            $supplier = Supplier::query()
                ->whereKey($validated['supplier_id'])
                ->where('is_active', true)
                ->first();

            if (!$supplier) {
                throw ValidationException::withMessages([
                    'supplier_id' =>
                        'Please select an active supplier.',
                ]);
            }

            // Count-based products must use whole numbers.

            if (
                in_array(
                    $product->unit_of_measure,
                    self::COUNT_UNITS,
                    true
                ) &&
                $receivedMilli % 1000 !== 0
            ) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        'This product uses whole units. Enter a whole number.',
                ]);
            }

            $beforeMilli = $this->toMilli(
                (string) $product->quantity
            );

            $afterMilli = $beforeMilli + $receivedMilli;

            if ($afterMilli > self::MAX_QUANTITY_MILLI) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        'The resulting stock quantity exceeds the allowed limit.',
                ]);
            }

            $before = $this->fromMilli($beforeMilli);
            $change = $this->fromMilli($receivedMilli);
            $after = $this->fromMilli($afterMilli);

            // Update current inventory.

            $product->quantity = $after;
            $product->save();

            // Create permanent stock movement history.

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'stock_in',
                'quantity_change' => $change,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'reason' => $validated['reason'] ?? null,
            ]);

            // Create supplier and delivery receipt details.

            $receipt = StockInReceipt::create([
                'stock_movement_id' => $movement->id,
                'supplier_id' => $supplier->id,
                'reference_number' =>
                    'SI-' . str_pad(
                        (string) $movement->id,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
                'received_at' => $validated['received_at'],
            ]);

            // Associate the movement with its receipt.

            $movement->reference_type = 'stock_in_receipt';
            $movement->reference_id = $receipt->id;
            $movement->save();
        }, 3);

        return redirect()
            ->route('inventory.stock-in.index')
            ->with('success', 'Stock received successfully.');
    }
}
