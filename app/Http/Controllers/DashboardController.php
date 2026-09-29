<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Service;
use App\Models\ServiceStatus;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the business dashboard.
     *
     * Seluruh payload (stats + recent) di-cache dengan SATU key stabil +
     * lock anti-stampede: pergantian key tidak memicu thundering herd saat
     * banyak hit konkuren. TTL 60 detik — untuk toko servis kecil ini tidak
     * bikin data basi (user bisa refresh manual kalau baru input data).
     *
     * Definisi "selesai" diambil dari Service::completionSlugs() — SATU
     * sumber kebenaran dengan pemicu jurnal pendapatan. Jangan hardcode
     * daftar slug di sini lagi.
     *
     * Range tanggal memakai whereBetween (bukan whereMonth/whereYear) agar
     * index tanggal (purchase_date, completed_at, transaction_date) kepakai
     * — fungsi MONTH()/YEAR() membunuh index.
     */
    public function index(): Response
    {
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        $payload = Cache::lock('dashboard.build', 10)->block(5, function () use ($monthStart, $monthEnd): array {
            return Cache::remember('dashboard.payload', 60, function () use ($monthStart, $monthEnd): array {
                // Lookup ID sekali → hindari subquery whereHas yang mahal
                // (whereHas menghasilkan EXISTS subselect ke laptop_statuses/
                // service_statuses setiap query).
                $tersediaId = LaptopStatus::query()->where('slug', 'tersedia')->value('id');
                $terjualId = LaptopStatus::query()->where('slug', 'terjual')->value('id');
                $finishedIds = ServiceStatus::query()->whereIn('slug', Service::completionSlugs())->pluck('id')->all();

                return [
                    'stats' => [
                        'total_laptops_available' => $tersediaId
                            ? Laptop::query()->where('laptop_status_id', $tersediaId)->count()
                            : 0,
                        'total_laptops_sold' => $terjualId
                            ? Laptop::query()->where('laptop_status_id', $terjualId)->count()
                            : 0,
                        'total_laptops_this_month' => Laptop::query()
                            ->whereBetween('purchase_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                            ->count(),
                        'total_active_services' => Service::query()
                            ->when($finishedIds !== [], fn ($q) => $q->whereNotIn('service_status_id', $finishedIds))
                            ->count(),
                        'total_completed_services' => Service::query()
                            ->when($finishedIds !== [], fn ($q) => $q->whereIn('service_status_id', $finishedIds))
                            ->whereBetween('completed_at', [$monthStart, $monthEnd])
                            ->count(),
                        'total_income_this_month' => FinancialTransaction::query()
                            ->where('type', 'income')
                            ->whereBetween('transaction_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                            ->sum('amount'),
                        'total_expense_this_month' => FinancialTransaction::query()
                            ->where('type', 'expense')
                            ->whereBetween('transaction_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                            ->sum('amount'),
                    ],
                    'recent_laptops' => Laptop::query()->with(['source', 'status', 'brand'])->latest()->limit(5)->get(),
                    'recent_services' => Service::query()->with(['customer', 'status'])->latest()->limit(5)->get(),
                ];
            });
        });

        return Inertia::render('dashboard', $payload);
    }
}
