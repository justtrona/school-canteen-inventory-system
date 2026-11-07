<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $status = $request->query('status') === 'inactive'
            ? 'inactive'
            : 'active';

        $suppliers = Supplier::query()
            ->withCount('products')
            ->where('is_active', $status === 'active')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inventory/Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    private function validateSupplier(
        Request $request,
        ?Supplier $supplier = null
    ): array {
        $request->merge([
            'name' => trim((string) $request->input('name', '')),
            'contact_person' => trim((string) $request->input('contact_person', '')),
            'phone' => preg_replace(
                '/[\s()-]+/',
                '',
                (string) $request->input('phone', '')
            ),
            'email' => strtolower(
                trim((string) $request->input('email', ''))
            ),
            'address' => trim((string) $request->input('address', '')),
        ]);

        return $request->validate([
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
                Rule::unique('suppliers', 'name')
                    ->ignore($supplier?->id),
            ],

            'contact_person' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],

            'phone' => [
                'required',
                'string',
                'max:30',
                'regex:/^(?:(?:\+639|639|09)\d{9}|(?:\+63|0)[2-8]\d{7,9})$/',
            ],

            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
            ],

            'address' => [
                'required',
                'string',
                'min:5',
                'max:1000',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ], [
            'name.required' =>
                'Supplier name is required.',

            'name.min' =>
                'Supplier name must have at least 3 characters.',

            'name.max' =>
                'Supplier name cannot exceed 255 characters.',

            'name.unique' =>
                'This supplier name already exists.',

            'contact_person.required' =>
                'Contact person is required.',

            'contact_person.min' =>
                'Contact person must have at least 2 characters.',

            'contact_person.max' =>
                'Contact person cannot exceed 255 characters.',

            'phone.required' =>
                'Contact number is required.',

            'phone.regex' =>
                'Enter a valid Philippine mobile or landline number.',

            'phone.max' =>
                'Contact number cannot exceed 30 characters.',

            'email.required' =>
                'Email address is required.',

            'email.email' =>
                'Enter a valid email address.',

            'email.max' =>
                'Email address cannot exceed 255 characters.',

            'address.required' =>
                'Supplier address is required.',

            'address.min' =>
                'Address must have at least 5 characters.',

            'address.max' =>
                'Address cannot exceed 1000 characters.',

            'is_active.required' =>
                'Please select a supplier status.',

            'is_active.boolean' =>
                'Invalid supplier status selected.',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateSupplier($request);

        Supplier::create($validated);

        return redirect()
            ->route('inventory.suppliers.index')
            ->with(
                'success',
                'Supplier added successfully.'
            );
    }

    public function update(
        Request $request,
        Supplier $supplier
    ): RedirectResponse {
        if (!$supplier->is_active) {
            throw ValidationException::withMessages([
                'supplier' =>
                    'Reactivate this supplier before editing it.',
            ]);
        }

        $validated = $this->validateSupplier(
            $request,
            $supplier
        );

        $supplier->update($validated);

        return redirect()
            ->route('inventory.suppliers.index')
            ->with(
                'success',
                'Supplier updated successfully.'
            );
    }

    public function deactivate(
        Supplier $supplier
    ): RedirectResponse {
        if (!$supplier->is_active) {
            throw ValidationException::withMessages([
                'supplier' =>
                    'This supplier is already inactive.',
            ]);
        }

        $supplier->update([
            'is_active' => false,
        ]);

        return back()->with(
            'success',
            'Supplier deactivated successfully.'
        );
    }

    public function reactivate(
        Supplier $supplier
    ): RedirectResponse {
        if ($supplier->is_active) {
            throw ValidationException::withMessages([
                'supplier' =>
                    'This supplier is already active.',
            ]);
        }

        $supplier->update([
            'is_active' => true,
        ]);

        return back()->with(
            'success',
            'Supplier reactivated successfully.'
        );
    }
}
