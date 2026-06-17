<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinancialTransactionController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LaptopController;
use App\Http\Controllers\LaptopPhotoController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\WebsiteSettingController;
use App\Http\Controllers\MasterData\BrandController;
use App\Http\Controllers\MasterData\CategoryController;
use App\Http\Controllers\MasterData\LaptopSourceController;
use App\Http\Controllers\MasterData\LaptopStatusController;
use App\Http\Controllers\MasterData\PaymentMethodController;
use App\Http\Controllers\MasterData\ServiceStatusController;
use App\Http\Controllers\MasterData\SparepartTypeController;
use App\Http\Controllers\MasterData\TransactionCategoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServicePartController;
use App\Http\Controllers\ServiceUpdateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('shop', [HomeController::class, 'laptopCatalog'])->name('laptops.catalog');
Route::get('laptops/{laptop}', [HomeController::class, 'laptopShow'])->name('laptops.public.show');
Route::get('services/track/{trackingCode}', [ServiceController::class, 'track'])->name('services.track');

Route::middleware(['auth', 'verified', 'role:admin,staff'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Service Management
    Route::resource('services', ServiceController::class);
    Route::post('services/{service}/updates', [ServiceUpdateController::class, 'store'])->name('services.updates.store');
    Route::post('services/{service}/parts', [ServicePartController::class, 'store'])->name('services.parts.store');
    Route::delete('services/{service}/parts/{part}', [ServicePartController::class, 'destroy'])->name('services.parts.destroy');

    // Laptop photo uploads (staff dapat mengunggah foto pendukung)
    Route::post('laptops/{laptop}/photos', [LaptopPhotoController::class, 'store'])->name('laptops.photos.store');
    Route::delete('laptops/{laptop}/photos/{photo}', [LaptopPhotoController::class, 'destroy'])->name('laptops.photos.destroy');

    // Global search
    Route::get('search', [SearchController::class, 'index'])->name('search');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('master-data', [MasterDataController::class, 'index'])->name('master-data.index');

    // Laptop Management
    Route::resource('laptops', LaptopController::class)->except(['show']);
    // Customer Management
    Route::resource('customers', CustomerController::class);

    // Financial Transactions
    Route::resource('financial-transactions', FinancialTransactionController::class);

    // Website Settings (singleton)
    Route::get('website-settings', [WebsiteSettingController::class, 'edit'])->name('website-settings.edit');
    Route::put('website-settings', [WebsiteSettingController::class, 'update'])->name('website-settings.update');

    // Master Data
    Route::prefix('master-data')->name('master-data.')->group(function () {
        Route::resource('brands', BrandController::class);
        Route::resource('categories', CategoryController::class);
        Route::resource('laptop-sources', LaptopSourceController::class);
        Route::resource('laptop-statuses', LaptopStatusController::class);
        Route::resource('service-statuses', ServiceStatusController::class);
        Route::resource('transaction-categories', TransactionCategoryController::class);
        Route::resource('payment-methods', PaymentMethodController::class);
        Route::resource('sparepart-types', SparepartTypeController::class);
    });
});

require __DIR__.'/settings.php';
