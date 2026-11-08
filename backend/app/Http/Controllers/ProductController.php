<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
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
    // ========================================
    // PRODUCT LIST
    // ========================================

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

    // ========================================
    // SKU GENERATION
    // ========================================

    private function generateNextSku(Category $category): string
    {
        if (!$category->is_active) {
            throw ValidationException::withMessages([
                'category_id' =>
                    'Please select an active category.',
            ]);
        }

        $prefix = strtoupper(
            trim((string) $category->sku_prefix)
        );

        if ($prefix === '') {
            throw ValidationException::withMessages([
                'category_id' =>
                    'This category does not have an SKU prefix yet.',
            ]);
        }

        $existingSkus = Product::query()
            ->where('sku', 'like', $prefix . '-%')
            ->pluck('sku');

        $highestNumber = 0;

        $pattern = '/^'
            . preg_quote($prefix, '/')
            . '-(\d+)$/i';

        foreach ($existingSkus as $existingSku) {
            if (preg_match($pattern, $existingSku, $matches)) {
                $number = (int) $matches[1];

                if ($number > $highestNumber) {
                    $highestNumber = $number;
                }
            }
        }

        $nextNumber = $highestNumber + 1;

        return $prefix
            . '-'
            . str_pad(
                (string) $nextNumber,
                3,
                '0',
                STR_PAD_LEFT
            );
    }

    // ========================================
    // NEXT SKU PREVIEW
    // ========================================

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

    // ========================================
    // STORE PRODUCT
    // ========================================

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'name' => trim(
                (string) $request->input('name', '')
            ),

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
            'name.required' =>
                'Product name is required.',

            'name.min' =>
                'Product name must have at least 3 characters.',

            'category_id.required' =>
                'Please select a product category.',

            'category_id.exists' =>
                'Please select an active category.',

            'price.required' =>
                'Product price is required.',

            'price.numeric' =>
                'Enter a valid product price.',

            'price.decimal' =>
                'Price can have up to 2 decimal places.',

            'unit_of_measure.required' =>
                'Please select a unit of measurement.',

            'unit_of_measure.in' =>
                'The selected unit of measurement is invalid.',

            'reorder_level.required' =>
                'Reorder level is required.',

            'reorder_level.numeric' =>
                'Reorder level must be a valid number.',

            'reorder_level.min' =>
                'Reorder level cannot be negative.',

            'reorder_level.decimal' =>
                'Reorder level can have up to 3 decimal places.',

            'is_active.required' =>
                'Please select a product status.',
        ]);

        DB::transaction(function () use ($validated) {

            // Lock category while generating SKU.
            $category = Category::query()
                ->whereKey($validated['category_id'])
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (!$category) {
                throw ValidationException::withMessages([
                    'category_id' =>
                        'Please select an active category.',
                ]);
            }

            $sku = $this->generateNextSku($category);

            $product = new Product();

            $product->sku = $sku;
            $product->name = $validated['name'];
            $product->category_id = $category->id;

            $product->description =
                $validated['description'] ?? null;

            $product->price = $validated['price'];

            // Inventory measurement settings.
            $product->unit_of_measure =
                $validated['unit_of_measure'];

            $product->reorder_level =
                $validated['reorder_level'];

            // Every new product starts with zero stock.
            $product->quantity = 0;

            $product->is_active = $validated['is_active'];

            $product->save();

        }, 3);

        return redirect()
            ->route('inventory.products.index')
            ->with(
                'success',
                'Product added successfully.'
            );
    }

    // ========================================
    // UPDATE PRODUCT
    // ========================================

    public function update(
        Request $request,
        Product $product
    ): RedirectResponse {

        $request->merge([
            'name' => trim(
                (string) $request->input('name', '')
            ),

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
            'name.required' =>
                'Product name is required.',

            'name.min' =>
                'Product name must have at least 3 characters.',

            'category_id.integer' =>
                'Please select a valid category.',

            'price.required' =>
                'Product price is required.',

            'price.numeric' =>
                'Enter a valid product price.',

            'price.decimal' =>
                'Price can have up to 2 decimal places.',

            'unit_of_measure.required' =>
                'Please select a unit of measurement.',

            'unit_of_measure.in' =>
                'The selected unit of measurement is invalid.',

            'reorder_level.required' =>
                'Reorder level is required.',

            'reorder_level.numeric' =>
                'Reorder level must be a valid number.',

            'reorder_level.min' =>
                'Reorder level cannot be negative.',

            'reorder_level.decimal' =>
                'Reorder level can have up to 3 decimal places.',
        ]);

        DB::transaction(function () use (
            $validated,
            $product
        ) {

            // Lock the product before checking its inventory history.
            $lockedProduct = Product::query()
                ->whereKey($product->id)
                ->lockForUpdate()
                ->firstOrFail();

            // ========================================
            // CATEGORY VALIDATION
            // ========================================

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
                                'category_id' =>
                                    'Please select an active category.',
                            ]);
                        }

                    } else {

                        $categoryExists = Category::query()
                            ->whereKey($newCategoryId)
                            ->exists();

                        if (!$categoryExists) {
                            throw ValidationException::withMessages([
                                'category_id' =>
                                    'The selected category no longer exists.',
                            ]);
                        }
                    }
                }
            }

            // ========================================
            // UNIT OF MEASUREMENT PROTECTION
            // ========================================

            $unitChanged =
                $validated['unit_of_measure'] !==
                $lockedProduct->unit_of_measure;

            if ($unitChanged) {

                $hasExistingStock =
                    (float) $lockedProduct->quantity > 0;

                $hasStockHistory =
                    $lockedProduct->stockMovements()->exists();

                if ($hasExistingStock || $hasStockHistory) {
                    throw ValidationException::withMessages([
                        'unit_of_measure' =>
                            'The unit of measurement cannot be changed because this product already has inventory records. Create a new product with the correct unit instead.',
                    ]);
                }
            }

            // ========================================
            // SAVE PRODUCT INFORMATION
            // ========================================

            $lockedProduct->name = $validated['name'];

            // Only change category when supplied.
            if (array_key_exists('category_id', $validated)) {
                $lockedProduct->category_id =
                    $validated['category_id'];
            }

            $lockedProduct->description =
                $validated['description'] ?? null;

            $lockedProduct->price =
                $validated['price'];

            $lockedProduct->unit_of_measure =
                $validated['unit_of_measure'];

            $lockedProduct->reorder_level =
                $validated['reorder_level'];

            $lockedProduct->is_active =
                $validated['is_active'];

            // Quantity is intentionally not updated here.
            // Stock changes must go through inventory transactions.

            $lockedProduct->save();

        }, 3);

        return redirect()
            ->route('inventory.products.index')
            ->with(
                'success',
                'Product updated successfully.'
            );
    }

    // ========================================
    // ARCHIVE PRODUCT
    // ========================================

    public function archive(
        Product $product
    ): RedirectResponse {

        if ($product->archived_at !== null) {
            return back()->withErrors([
                'archive' =>
                    'This product is already archived.',
            ]);
        }

        $product->forceFill([
            'archived_at' => now(),
            'is_active' => false,
        ])->save();

        return redirect()
            ->route('inventory.products.index')
            ->with(
                'success',
                'Product archived successfully.'
            );
    }

    // ========================================
    // RESTORE PRODUCT
    // ========================================

    public function restore(
        Product $product
    ): RedirectResponse {

        if ($product->archived_at === null) {
            return back()->withErrors([
                'restore' =>
                    'This product is not archived.',
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
            ->with(
                'success',
                'Product restored successfully.'
            );
    }
}
