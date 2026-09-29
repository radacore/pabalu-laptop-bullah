<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a paginated customer listing.
     */
    public function index(Request $request): Response
    {
        $customers = Customer::query()
            ->withCount('services')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the customer creation page.
     */
    public function create(): Response
    {
        return Inertia::render('customers/create');
    }

    /**
     * Store a newly created customer.
     *
     * Fitur auto-create User account sebelumnya dihapus — aplikasi ini
     * internal-only, tidak ada portal customer. Kalau ke depan portal
     * customer dibuat, tambahkan flow proper (email verification +
     * password reset link), bukan password random + email placeholder.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['create_user_account']);

        Customer::query()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pelanggan berhasil ditambahkan.']);

        return to_route('customers.index');
    }

    /**
     * Display the selected customer.
     */
    public function show(Customer $customer): Response
    {
        return Inertia::render('customers/show', [
            'pelanggan' => $customer->load(['services' => fn ($query) => $query->with('status')->latest()->limit(5)]),
        ]);
    }

    /**
     * Show the customer edit page.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('customers/edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the selected customer.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pelanggan berhasil diperbarui.']);

        return to_route('customers.index');
    }

    /**
     * Delete the selected customer.
     *
     * Ditolak bila masih punya servis, rental, atau penjualan sparepart
     * agar tidak 500 FK violation dan riwayat tidak yatim.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $relations = [
            'servis' => $customer->services()->exists(),
            'penyewaan' => $customer->rentals()->exists(),
            'penjualan sparepart' => $customer->sparepartSales()->exists(),
        ];

        foreach ($relations as $label => $exists) {
            if ($exists) {
                Inertia::flash('toast', ['type' => 'error', 'message' => "Pelanggan masih memiliki data {$label} dan tidak bisa dihapus."]);

                return back()->withErrors([
                    'customer' => "Pelanggan masih memiliki data {$label} dan tidak bisa dihapus.",
                ]);
            }
        }

        $customer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pelanggan berhasil dihapus.']);

        return to_route('customers.index');
    }
}
