<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockInReceipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = $request->query('category');
        $status = $request->query('status') === 'archived'
            ? 'archived'
            : 'active';

        $products = Product::query()
            ->with('category:id,name')
            ->when(
                $status === 'archived',
                fn ($query) => $query->whereNotNull('archived_at'),
                fn ($query) => $query->whereNull('archived_at')
            )
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when(
                filled($category),
                fn ($query) => $query->where('category_id', $category)
            )
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku_prefix']);

        return Inertia::render('Inventory/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'status' => $status,
            ],
            'units' => Product::UNITS,
        ]);
    }

    private function generateNextSku(Category $category): string
    {
        if (!$category->is_active) {
            throw ValidationException::withMessages([
                'category_id' => 'Please select an active category.',
            ]);
        }

        $prefix = strtoupper(trim((string) $category->sku_prefix));

        if ($prefix === '') {
            throw ValidationException::withMessages([
                'category_id' => 'This category does not have an SKU prefix yet.',
            ]);
        }

        $existingSkus = Product::query()
            ->where('sku', 'like', $prefix . '-%')
            ->pluck('sku');

        $highestNumber = 0;
        $pattern = '/^' . preg_quote($prefix, '/') . '-(\d+)$/i';

        foreach ($existingSkus as $existingSku) {
            if (preg_match($pattern, $existingSku, $matches)) {
                $highestNumber = max(
                    $highestNumber,
                    (int) $matches[1]
                );
            }
        }

        return $prefix . '-' . str_pad(
            (string) ($highestNumber + 1),
            3,
            '0',
            STR_PAD_LEFT
        );
    }

    public function nextSku(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('is_active', true),
            ],
        ]);

        $category = Category::query()
            ->whereKey($validated['category_id'])
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'sku' => $this->generateNextSku($category),
        ]);
    }

    private function validatePricing(
        string $price,
        string $purchaseCost
    ): void {
        $priceCents = $this->toCents($price);
        $costCents = $this->toCents($purchaseCost);

        if ($priceCents < $costCents) {
            throw ValidationException::withMessages([
                'price' =>
                    'Selling price cannot be lower than the purchase cost of ₱' .
                    number_format($costCents / 100, 2) .
                    '.',
            ]);
        }
    }

    private function toCents(string $amount): int
    {
        $parts = explode('.', $amount, 2);

        $whole = (int) $parts[0];
        $fraction = str_pad($parts[1] ?? '', 2, '0');

        return ($whole * 100) + (int) $fraction;
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'name' => trim((string) $request->input('name', '')),
            'description' => trim(
                (string) $request->input('description', '')
            ) ?: null,
        ]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
            ],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('is_active', true),
            ],
            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'purchase_cost' => [
                'required',
                'numeric',
                'gt:0',
                'max:99999999.99',
                'decimal:0,2',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.99',
                'decimal:0,2',
            ],
            'unit_of_measure' => [
                'required',
                'string',
                Rule::in(Product::UNITS),
            ],
            'reorder_level' => [
                'required',
                'numeric',
                'min:0',
                'max:999999999.999',
                'decimal:0,3',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ], [
            'name.required' => 'Product name is required.',
            'name.min' => 'Product name must have at least 3 characters.',
            'category_id.required' => 'Please select a product category.',
            'category_id.exists' => 'Please select an active category.',
            'purchase_cost.required' => 'Supplier purchase cost is required.',
            'purchase_cost.numeric' => 'Enter a valid purchase cost.',
            'purchase_cost.gt' => 'Purchase cost must be greater than zero.',
            'purchase_cost.decimal' => 'Purchase cost can have up to 2 decimal places.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Enter a valid product price.',
            'price.decimal' => 'Price can have up to 2 decimal places.',
            'unit_of_measure.required' => 'Please select a unit of measurement.',
            'unit_of_measure.in' => 'The selected unit of measurement is invalid.',
            'reorder_level.required' => 'Reorder level is required.',
            'reorder_level.numeric' => 'Reorder level must be a valid number.',
            'reorder_level.min' => 'Reorder level cannot be negative.',
            'reorder_level.decimal' => 'Reorder level can have up to 3 decimal places.',
            'is_active.required' => 'Please select a product status.',
        ]);

        $this->validatePricing(
            (string) $validated['price'],
            (string) $validated['purchase_cost']
        );

        DB::transaction(function () use ($validated) {
            $category = Category::query()
                ->whereKey($validated['category_id'])
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (!$category) {
                throw ValidationException::withMessages([
                    'category_id' => 'Please select an active category.',
                ]);
            }

            $product = new Product();

            $product->sku = $this->generateNextSku($category);
            $product->name = $validated['name'];
            $product->category_id = $category->id;
            $product->description = $validated['description'] ?? null;
            $product->purchase_cost = $validated['purchase_cost'];
            $product->price = $validated['price'];
            $product->unit_of_measure = $validated['unit_of_measure'];
            $product->reorder_level = $validated['reorder_level'];
            $product->quantity = 0;
            $product->is_active = $validated['is_active'];

            $product->save();
        }, 3);

        return redirect()
            ->route('inventory.products.index')
            ->with('success', 'Product added successfully.');
    }

    public function update(
        Request $request,
        Product $product
    ): RedirectResponse {
        $request->merge([
            'name' => trim((string) $request->input('name', '')),
            'description' => trim(
                (string) $request->input('description', '')
            ) ?: null,
        ]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
            ],
            'category_id' => [
                'sometimes',
                'nullable',
                'integer',
            ],
            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'purchase_cost' => [
                'sometimes',
                'nullable',
                'numeric',
                'gt:0',
                'max:99999999.99',
                'decimal:0,2',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.99',
                'decimal:0,2',
            ],
            'unit_of_measure' => [
                'required',
                'string',
                Rule::in(Product::UNITS),
            ],
            'reorder_level' => [
                'required',
                'numeric',
                'min:0',
                'max:999999999.999',
                'decimal:0,3',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ], [
            'name.required' => 'Product name is required.',
            'name.min' => 'Product name must have at least 3 characters.',
            'category_id.integer' => 'Please select a valid category.',
            'purchase_cost.numeric' => 'Enter a valid purchase cost.',
            'purchase_cost.gt' => 'Purchase cost must be greater than zero.',
            'purchase_cost.decimal' => 'Purchase cost can have up to 2 decimal places.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Enter a valid product price.',
            'price.decimal' => 'Price can have up to 2 decimal places.',
            'unit_of_measure.required' => 'Please select a unit of measurement.',
            'unit_of_measure.in' => 'The selected unit of measurement is invalid.',
            'reorder_level.required' => 'Reorder level is required.',
            'reorder_level.numeric' => 'Reorder level must be a valid number.',
            'reorder_level.min' => 'Reorder level cannot be negative.',
            'reorder_level.decimal' => 'Reorder level can have up to 3 decimal places.',
        ]);

        DB::transaction(function () use ($validated, $product) {
            $lockedProduct = Product::query()
                ->whereKey($product->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (array_key_exists('category_id', $validated)) {
                $newCategoryId = $validated['category_id'];

                if ($newCategoryId !== null) {
                    $isCurrentCategory =
                        (int) $newCategoryId ===
                        (int) $lockedProduct->category_id;

                    if (!$isCurrentCategory) {
                        $activeCategoryExists = Category::query()
                            ->whereKey($newCategoryId)
                            ->where('is_active', true)
                            ->exists();

                        if (!$activeCategoryExists) {
                            throw ValidationException::withMessages([
                                'category_id' => 'Please select an active category.',
                            ]);
                        }
                    } else {
                        $categoryExists = Category::query()
                            ->whereKey($newCategoryId)
                            ->exists();

                        if (!$categoryExists) {
                            throw ValidationException::withMessages([
                                'category_id' => 'The selected category no longer exists.',
                            ]);
                        }
                    }
                }
            }

            $unitChanged =
                $validated['unit_of_measure'] !==
                $lockedProduct->unit_of_measure;

            if ($unitChanged) {
                $hasExistingStock = (float) $lockedProduct->quantity > 0;
                $hasStockHistory = $lockedProduct->stockMovements()->exists();

                if ($hasExistingStock || $hasStockHistory) {
                    throw ValidationException::withMessages([
                        'unit_of_measure' =>
                            'The unit of measurement cannot be changed because this product already has inventory records. Create a new product with the correct unit instead.',
                    ]);
                }
            }

            $purchaseCost = array_key_exists(
                'purchase_cost',
                $validated
            ) && $validated['purchase_cost'] !== null
                ? (string) $validated['purchase_cost']
                : (
                    $lockedProduct->purchase_cost !== null
                        ? (string) $lockedProduct->purchase_cost
                        : null
                );

            $latestReceiptCost = StockInReceipt::query()
                ->join(
                    'stock_movements',
                    'stock_movements.id',
                    '=',
                    'stock_in_receipts.stock_movement_id'
                )
                ->where('stock_movements.product_id', $lockedProduct->id)
                ->whereNotNull('stock_in_receipts.unit_cost')
                ->orderByDesc('stock_in_receipts.received_at')
                ->orderByDesc('stock_in_receipts.id')
                ->value('stock_in_receipts.unit_cost');

            $requiredMinimum = $purchaseCost;

            if ($latestReceiptCost !== null) {
                if (
                    $requiredMinimum === null ||
                    $this->toCents((string) $latestReceiptCost) >
                    $this->toCents($requiredMinimum)
                ) {
                    $requiredMinimum = (string) $latestReceiptCost;
                }
            }

            if ($requiredMinimum !== null) {
                $this->validatePricing(
                    (string) $validated['price'],
                    $requiredMinimum
                );
            }

            $lockedProduct->name = $validated['name'];

            if (array_key_exists('category_id', $validated)) {
                $lockedProduct->category_id = $validated['category_id'];
            }

            $lockedProduct->description =
                $validated['description'] ?? null;

            if (
                array_key_exists('purchase_cost', $validated) &&
                $validated['purchase_cost'] !== null
            ) {
                $lockedProduct->purchase_cost =
                    $validated['purchase_cost'];
            }

            $lockedProduct->price = $validated['price'];
            $lockedProduct->unit_of_measure =
                $validated['unit_of_measure'];
            $lockedProduct->reorder_level =
                $validated['reorder_level'];
            $lockedProduct->is_active =
                $validated['is_active'];

            $lockedProduct->save();
        }, 3);

        return redirect()
            ->route('inventory.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function archive(Product $product): RedirectResponse
    {
        if ($product->archived_at !== null) {
            return back()->withErrors([
                'archive' => 'This product is already archived.',
            ]);
        }

        $product->forceFill([
            'archived_at' => now(),
            'is_active' => false,
        ])->save();

        return redirect()
            ->route('inventory.products.index')
            ->with('success', 'Product archived successfully.');
    }

    public function restore(Product $product): RedirectResponse
    {
        if ($product->archived_at === null) {
            return back()->withErrors([
                'restore' => 'This product is not archived.',
            ]);
        }

        $product->forceFill([
            'archived_at' => null,
            'is_active' => false,
        ])->save();

        return redirect()
            ->route(
                'inventory.products.index',
                ['status' => 'archived']
            )
            ->with('success', 'Product restored successfully.');
    }
}
