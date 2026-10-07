<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Service;
use App\Models\ServicePart;
use App\Models\ServiceStatus;
use App\Models\SparepartSale;
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

                // PENTING: simpan sebagai array polos (->toArray()), BUKAN
                // Collection/model Eloquent. Store cache `database` berjalan
                // dengan `serializable_classes=false` (hardening Laravel 13
                // anti object-injection) sehingga semua objek yang dibaca
                // kembali menjadi __PHP_Incomplete_Class dan dashboard crash
                // (recent_services.filter is not a function). Test suite
                // tidak menangkap ini karena memakai array store.
                $incomeMonth = (float) FinancialTransaction::query()
                    ->where('type', 'income')
                    ->whereBetween('transaction_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                    ->sum('amount');

                // Estimasi laba kotor = pemasukan − HPP bulan berjalan.
                // HPP: modal sparepart terjual (snapshot unit_cost) + modal
                // laptop terjual + modal part servis (dipakai & dijual).
                // Jasa servis tidak punya HPP (margin penuh).
                $cogsSpareparts = (float) SparepartSale::query()
                    ->whereBetween('sold_at', [$monthStart->toDateString(), $monthEnd->toDateString()])
                    ->selectRaw('COALESCE(SUM(COALESCE(unit_cost, 0) * quantity), 0) as cost')
                    ->value('cost');

                $cogsLaptops = $terjualId
                    ? (float) Laptop::query()
                        ->where('laptop_status_id', $terjualId)
                        ->whereBetween('sold_at', [$monthStart, $monthEnd])
                        ->sum('cost_price')
                    : 0;

                $cogsServiceParts = (float) ServicePart::query()
                    ->whereHas('service', fn ($q) => $q
                        ->when($finishedIds !== [], fn ($qq) => $qq->whereIn('service_status_id', $finishedIds))
                        ->whereBetween('completed_at', [$monthStart, $monthEnd]))
                    ->selectRaw('COALESCE(SUM(cost_price * quantity), 0) as cost')
                    ->value('cost');

                $grossProfit = $incomeMonth - $cogsSpareparts - $cogsLaptops - $cogsServiceParts;

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
                        'total_income_this_month' => $incomeMonth,
                        'total_expense_this_month' => FinancialTransaction::query()
                            ->where('type', 'expense')
                            ->whereBetween('transaction_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                            ->sum('amount'),
                        'total_gross_profit_this_month' => $grossProfit,
                    ],
                    'recent_laptops' => Laptop::query()->with(['source', 'status', 'brand'])->latest()->limit(5)->get()->toArray(),
                    'recent_services' => Service::query()->with(['customer', 'status'])->latest()->limit(5)->get()->toArray(),
                    'trend' => $this->trendPayload($terjualId, $finishedIds),
                ];
            });
        });

        return Inertia::render('dashboard', $payload);
    }

    /**
     * Tren aktual 8 bulan: unit terjual (sold_at) + servis selesai
     * (completed_at). Satu range-scan per seri lalu bucket di PHP —
     * tetap index-friendly tanpa fungsi MONTH()/YEAR() di SQL.
     *
     * Wajib array polos (string[] + int[]) agar selamat melewati
     * database cache store (lihat catatan di index()).
     *
     * @param  list<int>  $finishedIds
     * @return array{months: list<string>, sales: list<int>, service: list<int>}
     */
    private function trendPayload(?int $terjualId, array $finishedIds): array
    {
        $monthNames = [1 => 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        $starts = [];
        for ($i = 7; $i >= 0; $i--) {
            $starts[] = now()->subMonthsNoOverflow($i)->startOfMonth();
        }

        $keys = [];
        $labels = [];
        foreach ($starts as $start) {
            $keys[] = $start->format('Y-m');
            $labels[] = $monthNames[(int) $start->format('n')];
        }

        $sales = array_fill_keys($keys, 0);
        if ($terjualId) {
            $soldDates = Laptop::query()
                ->where('laptop_status_id', $terjualId)
                ->whereBetween('sold_at', [$starts[0], now()->endOfMonth()])
                ->pluck('sold_at');

            foreach ($soldDates as $date) {
                $key = $date instanceof \DateTimeInterface ? $date->format('Y-m') : substr((string) $date, 0, 7);

                if (isset($sales[$key])) {
                    $sales[$key]++;
                }
            }
        }

        $services = array_fill_keys($keys, 0);
        if ($finishedIds !== []) {
            $doneDates = Service::query()
                ->whereIn('service_status_id', $finishedIds)
                ->whereBetween('completed_at', [$starts[0], now()->endOfMonth()])
                ->pluck('completed_at');

            foreach ($doneDates as $date) {
                $key = $date instanceof \DateTimeInterface ? $date->format('Y-m') : substr((string) $date, 0, 7);

                if (isset($services[$key])) {
                    $services[$key]++;
                }
            }
        }

        $ordered = function (array $buckets) use ($keys): array {
            return array_map(fn (string $key): int => (int) $buckets[$key], $keys);
        };

        return [
            'months' => $labels,
            'sales' => $ordered($sales),
            'service' => $ordered($services),
        ];
    }
}
