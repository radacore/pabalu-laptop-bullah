<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Laptop;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Minimum panjang query untuk trigger search. Query 1-2 char terlalu
     * generic dan bikin LIKE %x% scan seluruh tabel. Ini mencegah DoS
     * via spam pencarian karakter tunggal.
     */
    private const MIN_QUERY_LENGTH = 3;

    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));

        $laptops = Collection::empty();
        $services = Collection::empty();
        $customers = Collection::empty();

        if (mb_strlen($q) >= self::MIN_QUERY_LENGTH) {
            $like = '%'.$q.'%';

            $laptops = Laptop::query()
                ->where(function ($query) use ($like) {
                    $query->where('name', 'like', $like)
                        ->orWhere('model', 'like', $like)
                        ->orWhere('sku', 'like', $like)
                        ->orWhereHas('brand', fn ($q) => $q->where('name', 'like', $like));
                })
                ->with(['status', 'brand'])
                ->orderBy('id', 'desc')
                ->limit(10)
                ->get();

            $services = Service::query()
                ->where(function ($query) use ($like) {
                    $query->where('service_code', 'like', $like)
                        ->orWhere('brand', 'like', $like)
                        ->orWhere('model', 'like', $like)
                        ->orWhere('complaint', 'like', $like);
                })
                ->with('customer', 'status')
                ->orderBy('id', 'desc')
                ->limit(10)
                ->get();

            // Hasil customer hanya untuk admin — staff diblokir di halaman
            // /customers, jadi jangan bocorkan lewat jalur search.
            if ($request->user()?->role === 'admin') {
                $customers = Customer::query()
                    ->where(function ($query) use ($like) {
                        $query->where('name', 'like', $like)
                            ->orWhere('phone', 'like', $like);
                    })
                    ->orderBy('id', 'desc')
                    ->limit(10)
                    ->get();
            }
        }

        return Inertia::render('search', [
            'q' => $q,
            'min_query_length' => self::MIN_QUERY_LENGTH,
            'laptops' => $laptops,
            'services' => $services,
            'customers' => $customers,
            'total' => $laptops->count() + $services->count() + $customers->count(),
        ]);
    }
}
