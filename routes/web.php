<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinancialTransactionController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LaptopController;
use App\Http\Controllers\LaptopPhotoController;
use App\Http\Controllers\MasterData\BrandController;
use App\Http\Controllers\MasterData\CategoryController;
use App\Http\Controllers\MasterData\LaptopSourceController;
use App\Http\Controllers\MasterData\LaptopStatusController;
use App\Http\Controllers\MasterData\PaymentMethodController;
use App\Http\Controllers\MasterData\ServiceStatusController;
use App\Http\Controllers\MasterData\SparepartTypeController;
use App\Http\Controllers\MasterData\TransactionCategoryController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\PublicRentalController;
use App\Http\Controllers\PublicSparepartController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServicePartController;
use App\Http\Controllers\ServiceUpdateController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\SparepartPhotoController;
use App\Http\Controllers\SparepartSaleController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\WebsiteSettingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('robots.txt', [SeoController::class, 'robots'])->name('seo.robots');
Route::get('sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
Route::get('shop', [HomeController::class, 'laptopCatalog'])->name('laptops.catalog');
Route::get('sparepart', [PublicSparepartController::class, 'catalog'])->name('spareparts.catalog');
Route::get('sparepart/{sparepart}', [PublicSparepartController::class, 'show'])->name('spareparts.public.show');
Route::get('sewa', [PublicRentalController::class, 'catalog'])->name('rentals.catalog');
Route::get('sewa/{laptop}', [PublicRentalController::class, 'show'])->name('rentals.public.show');
Route::get('rentals/track', [PublicRentalController::class, 'trackLanding'])->name('rentals.track.landing');
Route::get('rentals/track/{trackingCode}', [PublicRentalController::class, 'track'])
    ->middleware('throttle:10,1')
    ->name('rentals.track');
Route::get('services/track', [ServiceController::class, 'trackLanding'])->name('services.track.landing');
Route::get('services/track/{trackingCode}', [ServiceController::class, 'track'])
    ->middleware('throttle:10,1')
    ->name('services.track');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Service Management — ownership gating lewat ServicePolicy.
    // Route index+create+store tidak butuh model instance, dilindungi
    // hanya oleh role middleware. Route yang butuh $service instance
    // dipisah supaya bisa apply ->can().
    Route::resource('services', ServiceController::class)->only(['index', 'create', 'store']);
    Route::get('services/{service}', [ServiceController::class, 'show'])->name('services.show')->can('view', 'service');
    Route::get('services/{service}/edit', [ServiceController::class, 'edit'])->name('services.edit')->can('update', 'service');
    Route::match(['put', 'patch'], 'services/{service}', [ServiceController::class, 'update'])->name('services.update')->can('update', 'service');
    Route::delete('services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy')->can('delete', 'service');

    Route::post('services/{service}/updates', [ServiceUpdateController::class, 'store'])->name('services.updates.store')->can('update', 'service');
    Route::post('services/{service}/parts', [ServicePartController::class, 'store'])->name('services.parts.store')->can('update', 'service');
    Route::delete('services/{service}/parts/{part}', [ServicePartController::class, 'destroy'])->name('services.parts.destroy')->can('update', 'service');

    // Rental Management — ownership gating lewat RentalPolicy.
    // Pola sama seperti services: index+create+store tanpa instance,
    // sisanya dipisah supaya bisa apply ->can().
    Route::resource('rentals', RentalController::class)->only(['index', 'create', 'store']);
    Route::get('rentals/{rental}', [RentalController::class, 'show'])->name('rentals.show')->can('view', 'rental');
    Route::get('rentals/{rental}/edit', [RentalController::class, 'edit'])->name('rentals.edit')->can('update', 'rental');
    Route::match(['put', 'patch'], 'rentals/{rental}', [RentalController::class, 'update'])->name('rentals.update')->can('update', 'rental');
    Route::delete('rentals/{rental}', [RentalController::class, 'destroy'])->name('rentals.destroy')->can('delete', 'rental');

    // Sparepart inventory — ownership gating lewat SparepartPolicy.
    Route::resource('spareparts', SparepartController::class)->only(['index', 'create', 'store']);
    Route::get('spareparts/{sparepart}', [SparepartController::class, 'show'])->name('spareparts.show')->can('view', 'sparepart');
    Route::get('spareparts/{sparepart}/edit', [SparepartController::class, 'edit'])->name('spareparts.edit')->can('update', 'sparepart');
    Route::match(['put', 'patch'], 'spareparts/{sparepart}', [SparepartController::class, 'update'])->name('spareparts.update')->can('update', 'sparepart');
    Route::delete('spareparts/{sparepart}', [SparepartController::class, 'destroy'])->name('spareparts.destroy')->can('delete', 'sparepart');

    // Sparepart sales (immutable ledger, admin-only delete via policy before()).
    Route::get('sparepart-sales', [SparepartSaleController::class, 'index'])->name('sparepart-sales.index');
    Route::post('sparepart-sales', [SparepartSaleController::class, 'store'])->name('sparepart-sales.store');
    Route::delete('sparepart-sales/{sale}', [SparepartSaleController::class, 'destroy'])->name('sparepart-sales.destroy')->can('delete', 'sale');

    // Sparepart photo uploads (multi-foto seperti laptop).
    // HANYA admin — staff tidak boleh modifikasi inventory (konsisten
    // dengan SparepartPolicy: staff boleh create/update data, tapi hapus
    // dan kelola file hanya admin agar tidak ada penggelapan via foto).
    Route::post('spareparts/{sparepart}/photos', [SparepartPhotoController::class, 'store'])->name('spareparts.photos.store')->can('delete', 'sparepart');
    Route::delete('spareparts/{sparepart}/photos/{photo}', [SparepartPhotoController::class, 'destroy'])->name('spareparts.photos.destroy')->can('delete', 'sparepart');

    // Laptop photo uploads. HANYA admin — seluruh modul laptop admin-only.
    Route::post('laptops/{laptop}/photos', [LaptopPhotoController::class, 'store'])->name('laptops.photos.store');
    Route::delete('laptops/{laptop}/photos/{photo}', [LaptopPhotoController::class, 'destroy'])->name('laptops.photos.destroy');

    // Global search — throttle untuk mencegah DoS via spam pencarian
    Route::get('search', [SearchController::class, 'index'])
        ->middleware('throttle:30,1')
        ->name('search');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('master-data', [MasterDataController::class, 'index'])->name('master-data.index');

    // Laptop Management (admin — semua CRUD termasuk show untuk lihat detail apapun statusnya)
    Route::resource('laptops', LaptopController::class);
    // Customer Management
    Route::resource('customers', CustomerController::class);

    // Staff Management (akun tim internal admin/staff)
    Route::resource('staff', StaffController::class)->only(['index', 'create', 'store', 'edit', 'update']);

    // Financial Transactions — export CSV didaftarkan SEBELUM resource
    // agar tidak ditangkap route show.
    Route::get('financial-transactions/export/csv', [FinancialTransactionController::class, 'export'])->name('financial-transactions.export');
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

// Public laptop detail — path terpisah dari admin `/laptops/{laptop}` untuk mencegah
// user publik mengakses detail laptop yang belum "tersedia".
Route::get('shop/{laptop}', [HomeController::class, 'laptopShow'])->name('laptops.public.show');

require __DIR__.'/settings.php';
