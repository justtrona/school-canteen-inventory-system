<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $status = $request->query('status') === 'inactive'
            ? 'inactive'
            : 'active';

        $categories = Category::query()
            ->withCount('products')
            ->where('is_active', $status === 'active')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku_prefix', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inventory/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name'),
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'sku_prefix' => [
                'required',
                'string',
                'max:20',
                'alpha_dash',
                Rule::unique('categories', 'sku_prefix'),
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $validated['name'] = trim($validated['name']);

        $validated['sku_prefix'] = strtoupper(
            trim($validated['sku_prefix'])
        );

        $validated['description'] = isset($validated['description'])
            ? trim($validated['description'])
            : null;

        Category::create($validated);

        return back()->with(
            'success',
            'Category added successfully.'
        );
    }

    public function update(
        Request $request,
        Category $category
    ): RedirectResponse {
        if (!$category->is_active) {
            throw ValidationException::withMessages([
                'category' => 'Reactivate this category before editing it.',
            ]);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')
                    ->ignore($category->id),
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'sku_prefix' => [
                'required',
                'string',
                'max:20',
                'alpha_dash',
                Rule::unique('categories', 'sku_prefix')
                    ->ignore($category->id),
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $validated['name'] = trim($validated['name']);

        $validated['sku_prefix'] = strtoupper(
            trim($validated['sku_prefix'])
        );

        $validated['description'] = isset($validated['description'])
            ? trim($validated['description'])
            : null;

        if (
            !$validated['is_active'] &&
            $category->products()
                ->whereNull('archived_at')
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'is_active' => 'This category has current products. Archive or reassign them before setting the category to inactive.',
            ]);
        }

        $category->update($validated);

        return back()->with(
            'success',
            'Category updated successfully.'
        );
    }

    public function archive(Category $category): RedirectResponse
    {
        if (!$category->is_active) {
            throw ValidationException::withMessages([
                'category' => 'This category is already inactive.',
            ]);
        }

        if (
            $category->products()
                ->whereNull('archived_at')
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'category' => 'This category has current products. Archive or reassign them before deactivating the category.',
            ]);
        }

        $category->update([
            'is_active' => false,
        ]);

        return back()->with(
            'success',
            'Category deactivated successfully.'
        );
    }

    public function restore(Category $category): RedirectResponse
    {
        if ($category->is_active) {
            throw ValidationException::withMessages([
                'category' => 'This category is already active.',
            ]);
        }

        $category->update([
            'is_active' => true,
        ]);

        return back()->with(
            'success',
            'Category reactivated successfully.'
        );
    }
}
