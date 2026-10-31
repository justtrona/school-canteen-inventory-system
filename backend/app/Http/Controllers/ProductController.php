<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): Response
{
    // ========================================
    // FILTER VALUES
    // ========================================

    $search = trim((string) $request->query('search', ''));

    $category = $request->query('category');

    $status = $request->query('status') === 'archived'
        ? 'archived'
        : 'active';

    // ========================================
    // PRODUCTS QUERY
    // ========================================

    $products = Product::query()
        ->with('category:id,name')

        // Filter current or archived products
        ->when(
            $status === 'archived',
            fn ($query) => $query->whereNotNull('archived_at'),
            fn ($query) => $query->whereNull('archived_at')
        )

        // Search by product name or SKU
        ->when($search !== '', function ($query) use ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        })

        // Filter by category
        ->when(
            filled($category),
            fn ($query) => $query->where('category_id', $category)
        )

        // Sort alphabetically
        ->orderBy('name')

        // Pagination
        ->paginate(10)
        ->withQueryString();

    // ========================================
    // CATEGORIES
    // ========================================

    $categories = Category::query()
        ->orderBy('name')
        ->get(['id', 'name']);

    // ========================================
    // INERTIA RESPONSE
    // ========================================

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

    public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'sku' => [
            'required',
            'string',
            'max:50',
            Rule::unique('products', 'sku'),
        ],
        'name' => ['required', 'string', 'max:255'],
        'category_id' => [
            'nullable',
            'integer',
            Rule::exists('categories', 'id')->where('is_active', true),
        ],
        'description' => ['nullable', 'string'],
        'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
        'is_active' => ['required', 'boolean'],
    ]);

    $validated['sku'] = trim($validated['sku']);
    $validated['name'] = trim($validated['name']);
    $validated['quantity'] = 0;

    DB::transaction(function () use ($validated) {
        $product = new Product();

        $product->sku = $validated['sku'];
        $product->name = $validated['name'];
        $product->category_id = $validated['category_id'] ?? null;
        $product->description = $validated['description'] ?? null;
        $product->price = $validated['price'];
        $product->quantity = 0;
        $product->is_active = $validated['is_active'];

        $product->save();
    });

    return redirect()
        ->route('inventory.products.index')
        ->with('success', 'Product added successfully.');
}

public function update(Request $request, Product $product): RedirectResponse
{
    $validated = $request->validate([
        'sku' => [
            'required',
            'string',
            'max:50',
            Rule::unique('products', 'sku')->ignore($product->id),
        ],
        'name' => ['required', 'string', 'max:255'],
        'category_id' => [
            'nullable',
            'integer',
            Rule::exists('categories', 'id'),
        ],
        'description' => ['nullable', 'string'],
        'price' => [
            'required',
            'numeric',
            'min:0',
            'max:99999999.99',
        ],
        'is_active' => ['required', 'boolean'],
    ]);

    $product->update($validated);

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
        ->route('inventory.products.index', ['status' => 'archived'])
        ->with('success', 'Product restored successfully.');
}
}