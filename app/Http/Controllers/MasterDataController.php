<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\ServiceStatus;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('master-data/index', [
            'groups' => [
                [
                    'key' => 'inventory',
                    'title' => 'Inventori',
                    'description' => 'Referensi untuk unit laptop',
                    'items' => [
                        ['key' => 'brands', 'title' => 'Merek', 'description' => 'Daftar merek laptop', 'icon' => 'award', 'href' => '/master-data/brands', 'count' => Brand::count()],
                        ['key' => 'categories', 'title' => 'Kategori', 'description' => 'Kategori produk', 'icon' => 'tag', 'href' => '/master-data/categories', 'count' => Category::count()],
                        ['key' => 'laptop-sources', 'title' => 'Sumber Laptop', 'description' => 'Asal perolehan unit', 'icon' => 'package', 'href' => '/master-data/laptop-sources', 'count' => LaptopSource::count()],
                        ['key' => 'laptop-statuses', 'title' => 'Status Laptop', 'description' => 'Label status inventaris', 'icon' => 'circle-dot', 'href' => '/master-data/laptop-statuses', 'count' => LaptopStatus::count()],
                    ],
                ],
                [
                    'key' => 'services',
                    'title' => 'Servis',
                    'description' => 'Referensi alur kerja servis',
                    'items' => [
                        ['key' => 'service-statuses', 'title' => 'Status Servis', 'description' => 'Tahapan alur servis', 'icon' => 'wrench', 'href' => '/master-data/service-statuses', 'count' => ServiceStatus::count()],
                        ['key' => 'sparepart-types', 'title' => 'Tipe Sparepart', 'description' => 'Kategori komponen', 'icon' => 'cpu', 'href' => '/master-data/sparepart-types', 'count' => SparepartType::count()],
                    ],
                ],
                [
                    'key' => 'finance',
                    'title' => 'Keuangan',
                    'description' => 'Referensi transaksi',
                    'items' => [
                        ['key' => 'transaction-categories', 'title' => 'Kategori Transaksi', 'description' => 'Tipe pemasukan/pengeluaran', 'icon' => 'wallet', 'href' => '/master-data/transaction-categories', 'count' => TransactionCategory::count()],
                        ['key' => 'payment-methods', 'title' => 'Metode Pembayaran', 'description' => 'Cara pembayaran', 'icon' => 'credit-card', 'href' => '/master-data/payment-methods', 'count' => PaymentMethod::count()],
                    ],
                ],
            ],
            'totals' => [
                'groups' => 3,
                'items' => Brand::count() + Category::count() + LaptopSource::count() + LaptopStatus::count() + ServiceStatus::count() + SparepartType::count() + TransactionCategory::count() + PaymentMethod::count(),
            ],
        ]);
    }
}
