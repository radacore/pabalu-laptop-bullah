<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    /** Display a paginated payment method listing. */
    public function index(Request $request): Response { return Inertia::render('master-data/payment-methods/index', ['paymentMethods' => PaymentMethod::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(), 'filters' => $request->only('search')]); }

    /** Show the payment method creation page. */
    public function create(): Response { return Inertia::render('master-data/payment-methods/create'); }

    /** Store a newly created payment method. */
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); PaymentMethod::query()->create([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Metode pembayaran berhasil ditambahkan.']); return to_route('master-data.payment-methods.index'); }

    /** Show the payment method edit page. */
    public function edit(PaymentMethod $paymentMethod): Response { return Inertia::render('master-data/payment-methods/edit', ['paymentMethod' => $paymentMethod]); }

    /** Update the selected payment method. */
    public function update(Request $request, PaymentMethod $paymentMethod): RedirectResponse { $data = $this->validated($request); $paymentMethod->update([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Metode pembayaran berhasil diperbarui.']); return to_route('master-data.payment-methods.index'); }

    /** Delete the selected payment method. */
    public function destroy(PaymentMethod $paymentMethod): RedirectResponse { $paymentMethod->delete(); Inertia::flash('toast', ['type' => 'success', 'message' => 'Metode pembayaran berhasil dihapus.']); return to_route('master-data.payment-methods.index'); }

    /** @return array<string, mixed> */
    private function validated(Request $request): array { return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string']]); }
}
