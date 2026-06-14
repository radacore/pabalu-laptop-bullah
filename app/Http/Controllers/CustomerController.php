<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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
            ->with('user:id,email')
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
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $createUserAccount = (bool) ($data['create_user_account'] ?? false);
        unset($data['create_user_account']);

        DB::transaction(function () use ($data, $createUserAccount): void {
            $userId = null;

            if ($createUserAccount) {
                $user = User::query()->firstOrCreate(
                    ['phone' => $data['phone']],
                    [
                        'name' => $data['name'],
                        'email' => $this->customerEmail($data['phone']),
                        'password' => Str::password(16),
                        'role' => 'customer',
                        'is_active' => true,
                    ]
                );

                $userId = $user->id;
            }

            Customer::query()->create([
                ...$data,
                'user_id' => $userId,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pelanggan berhasil ditambahkan.']);

        return to_route('customers.index');
    }

    /**
     * Display the selected customer.
     */
    public function show(Customer $customer): Response
    {
        return Inertia::render('customers/show', [
            'customer' => $customer->load(['user', 'services' => fn ($query) => $query->with('status')->latest()->limit(5)]),
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
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pelanggan berhasil dihapus.']);

        return to_route('customers.index');
    }

    /**
     * Build a deterministic placeholder email for phone-only customer accounts.
     */
    private function customerEmail(string $phone): string
    {
        $phone = preg_replace('/\D+/', '', $phone) ?: Str::random(8);

        return "customer-{$phone}@pabalu.local";
    }
}
