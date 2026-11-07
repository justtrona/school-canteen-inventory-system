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
        ]);
    }

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

        $sku = $this->generateNextSku($category);

        return response()->json([
            'sku' => $sku,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
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
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.99',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        DB::transaction(function () use ($validated) {
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
            $product->name = trim($validated['name']);
            $product->category_id = $category->id;
            $product->description =
                $validated['description'] ?? null;
            $product->price = $validated['price'];
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

    public function update(
        Request $request,
        Product $product
    ): RedirectResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'category_id' => [
                'nullable',
                'integer',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.99',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $newCategoryId = $validated['category_id'] ?? null;

        if ($newCategoryId !== null) {
            $isCurrentCategory =
                (int) $newCategoryId ===
                (int) $product->category_id;

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

        $product->name = trim($validated['name']);
        $product->category_id = $newCategoryId;
        $product->description =
            $validated['description'] ?? null;
        $product->price = $validated['price'];
        $product->is_active = $validated['is_active'];

        $product->save();

        return redirect()
            ->route('inventory.products.index')
            ->with(
                'success',
                'Product updated successfully.'
            );
    }

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
