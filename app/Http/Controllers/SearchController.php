<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Laptop;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));

        $laptops = collect();
        $services = collect();
        $customers = collect();

        if ($q !== '') {
            $like = '%'.$q.'%';

            $laptops = Laptop::query()
                ->where(function ($query) use ($like) {
                    $query->where('name', 'like', $like)
                        ->orWhere('brand', 'like', $like)
                        ->orWhere('model', 'like', $like)
                        ->orWhere('sku', 'like', $like);
                })
                ->with('status')
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

            $customers = Customer::query()
                ->where(function ($query) use ($like) {
                    $query->where('name', 'like', $like)
                        ->orWhere('phone', 'like', $like);
                })
                ->orderBy('id', 'desc')
                ->limit(10)
                ->get();
        }

        return Inertia::render('search', [
            'q' => $q,
            'laptops' => $laptops,
            'services' => $services,
            'customers' => $customers,
            'total' => $laptops->count() + $services->count() + $customers->count(),
        ]);
    }
}
