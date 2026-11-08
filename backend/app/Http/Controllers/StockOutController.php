<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockOutController extends Controller
{
    private const COUNT_UNITS = [
        'pcs',
        'bottle',
        'pack',
        'box',
    ];

    private const MAX_QUANTITY_MILLI = 999999999999;

    private const REASONS = [
        'damaged',
        'expired',
        'spoiled',
        'internal_use',
        'inventory_correction',
        'other',
    ];

    // ========================================
    // STOCK OUT LIST
    // ========================================

    public function index(Request $request): Response
    {
        $search = trim(
            (string) $request->query('search', '')
        );

        $stockOuts = StockMovement::query()
            ->where('type', 'stock_out')
            ->with([
                'product:id,name,sku,unit_of_measure',
                'user:id,name',
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereHas('product', function ($productQuery) use ($search) {
                        $productQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    })->orWhere('reason', 'like', "%{$search}%");
                });
            })
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

        return Inertia::render('Inventory/StockOut/Index', [
            'stockOuts' => $stockOuts,
            'products' => $products,
            'filters' => [
                'search' => $search,
            ],
            'reasons' => self::REASONS,
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
    // STORE STOCK OUT
    // ========================================

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id'),
            ],

            'quantity' => [
                'required',
                'numeric',
                'gt:0',
                'max:999999999.999',
                'decimal:0,3',
            ],

            'reason' => [
                'required',
                'string',
                Rule::in(self::REASONS),
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ], [
            'product_id.required' =>
                'Please select a product.',

            'product_id.exists' =>
                'The selected product does not exist.',

            'quantity.required' =>
                'Released quantity is required.',

            'quantity.gt' =>
                'Released quantity must be greater than zero.',

            'quantity.decimal' =>
                'Quantity can have up to 3 decimal places.',

            'reason.required' =>
                'Please select a reason for stock removal.',

            'reason.in' =>
                'Please select a valid stock-out reason.',
        ]);

        $quantityText = trim(
            (string) $request->input('quantity', '')
        );

        if (!preg_match(
            '/^(?:0|[1-9][0-9]{0,8})(?:\.[0-9]{1,3})?$/',
            $quantityText
        )) {
            throw ValidationException::withMessages([
                'quantity' =>
                    'Enter a valid quantity with up to 3 decimal places.',
            ]);
        }

        $releasedMilli = $this->toMilli($quantityText);

        if ($releasedMilli <= 0) {
            throw ValidationException::withMessages([
                'quantity' =>
                    'Released quantity must be greater than zero.',
            ]);
        }

        $reasonLabels = [
            'damaged' => 'Damaged',
            'expired' => 'Expired',
            'spoiled' => 'Spoiled',
            'internal_use' => 'Internal Use',
            'inventory_correction' => 'Inventory Correction',
            'other' => 'Other',
        ];

        DB::transaction(function () use (
            $validated,
            $releasedMilli,
            $reasonLabels
        ) {
            // Lock product to prevent simultaneous deductions.

            $product = Product::query()
                ->whereKey($validated['product_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (
                !$product->is_active ||
                $product->archived_at !== null
            ) {
                throw ValidationException::withMessages([
                    'product_id' =>
                        'Please select an active, non-archived product.',
                ]);
            }

            // Count-based products require whole quantities.

            if (
                in_array(
                    $product->unit_of_measure,
                    self::COUNT_UNITS,
                    true
                ) &&
                $releasedMilli % 1000 !== 0
            ) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        'This product uses whole units. Enter a whole number.',
                ]);
            }

            $beforeMilli = $this->toMilli(
                (string) $product->quantity
            );

            // Prevent stock from becoming negative.

            if ($releasedMilli > $beforeMilli) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        'Insufficient stock. Available quantity is '
                        . $this->fromMilli($beforeMilli)
                        . ' '
                        . $product->unit_of_measure
                        . '.',
                ]);
            }

            $afterMilli = $beforeMilli - $releasedMilli;

            $before = $this->fromMilli($beforeMilli);
            $change = $this->fromMilli($releasedMilli);
            $after = $this->fromMilli($afterMilli);

            // Combine reason and optional remarks.

            $reason = $reasonLabels[$validated['reason']];

            if (!empty($validated['remarks'])) {
                $reason .= ' - ' . trim($validated['remarks']);
            }

            // Update current inventory.

            $product->quantity = $after;
            $product->save();

            // Create permanent stock movement history.
            // Negative quantity_change represents stock removal.

            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'stock_out',
                'quantity_change' => '-' . $change,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'reason' => $reason,
            ]);
        }, 3);

        return redirect()
            ->route('inventory.stock-out.index')
            ->with(
                'success',
                'Stock released successfully.'
            );
    }
}
