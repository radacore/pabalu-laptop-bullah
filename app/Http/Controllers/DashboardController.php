<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the business dashboard.
     */
    public function index(): Response
    {
        $currentMonth = now();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_laptops_available' => Laptop::query()->whereHas('status', fn ($query) => $query->where('slug', 'tersedia'))->count(),
                'total_laptops_sold' => Laptop::query()->whereHas('status', fn ($query) => $query->where('slug', 'terjual'))->count(),
                'total_laptops_this_month' => Laptop::query()->whereMonth('purchase_date', $currentMonth->month)->whereYear('purchase_date', $currentMonth->year)->count(),
                'total_active_services' => Service::query()->whereDoesntHave('status', fn ($query) => $query->whereIn('slug', ['selesai', 'sudah-diambil', 'dibatalkan']))->count(),
                'total_completed_services' => Service::query()->whereMonth('completed_at', $currentMonth->month)->whereYear('completed_at', $currentMonth->year)->count(),
                'total_income_this_month' => FinancialTransaction::query()->where('type', 'income')->whereMonth('transaction_date', $currentMonth->month)->whereYear('transaction_date', $currentMonth->year)->sum('amount'),
                'total_expense_this_month' => FinancialTransaction::query()->where('type', 'expense')->whereMonth('transaction_date', $currentMonth->month)->whereYear('transaction_date', $currentMonth->year)->sum('amount'),
            ],
            'recent_laptops' => Laptop::query()->with(['source', 'status'])->latest()->limit(5)->get(),
            'recent_services' => Service::query()->with(['customer', 'status'])->latest()->limit(5)->get(),
        ]);
    }
}
