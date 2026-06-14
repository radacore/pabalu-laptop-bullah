<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\ServiceStatus;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        Brand::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Apple', 'slug' => 'apple'],
            ['name' => 'Asus', 'slug' => 'asus'],
            ['name' => 'Acer', 'slug' => 'acer'],
            ['name' => 'Dell', 'slug' => 'dell'],
            ['name' => 'HP', 'slug' => 'hp'],
            ['name' => 'Lenovo', 'slug' => 'lenovo'],
            ['name' => 'Samsung', 'slug' => 'samsung'],
            ['name' => 'MSI', 'slug' => 'msi'],
            ['name' => 'Toshiba', 'slug' => 'toshiba'],
            ['name' => 'Fujitsu', 'slug' => 'fujitsu'],
            ['name' => 'Sony', 'slug' => 'sony'],
            ['name' => 'Xiaomi', 'slug' => 'xiaomi'],
            ['name' => 'Huawei', 'slug' => 'huawei'],
        ]));

        Category::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Ultrabook', 'slug' => 'ultrabook'],
            ['name' => 'Gaming', 'slug' => 'gaming'],
            ['name' => 'Business', 'slug' => 'business'],
            ['name' => 'Multimedia', 'slug' => 'multimedia'],
            ['name' => 'Entry Level', 'slug' => 'entry-level'],
            ['name' => 'Workstation', 'slug' => 'workstation'],
        ]));

        LaptopSource::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Beli di Pegadaian', 'slug' => 'beli-di-pegadaian'],
            ['name' => 'Beli dari toko', 'slug' => 'beli-dari-toko'],
            ['name' => 'Beli dari customer', 'slug' => 'beli-dari-customer'],
            ['name' => 'Beli dari marketplace', 'slug' => 'beli-dari-marketplace'],
            ['name' => 'Tukar tambah', 'slug' => 'tukar-tambah'],
            ['name' => 'Supplier', 'slug' => 'supplier'],
            ['name' => 'Lainnya', 'slug' => 'lainnya'],
        ]));

        LaptopStatus::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Draft', 'slug' => 'draft', 'color' => '#64748b'],
            ['name' => 'Tersedia', 'slug' => 'tersedia', 'color' => '#10b981'],
            ['name' => 'Booking', 'slug' => 'booking', 'color' => '#3b82f6'],
            ['name' => 'Terjual', 'slug' => 'terjual', 'color' => '#8b5cf6'],
            ['name' => 'Rusak', 'slug' => 'rusak', 'color' => '#ef4444'],
            ['name' => 'Disimpan', 'slug' => 'disimpan', 'color' => '#f59e0b'],
        ]));

        ServiceStatus::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Diterima', 'slug' => 'diterima', 'color' => 'amber'],
            ['name' => 'Dicek Teknisi', 'slug' => 'dicek-teknisi', 'color' => 'blue'],
            ['name' => 'Menunggu Konfirmasi', 'slug' => 'menunggu-konfirmasi', 'color' => 'orange'],
            ['name' => 'Dalam Pengerjaan', 'slug' => 'dalam-pengerjaan', 'color' => 'blue'],
            ['name' => 'Menunggu Sparepart', 'slug' => 'menunggu-sparepart', 'color' => 'amber'],
            ['name' => 'Pergantian Alat', 'slug' => 'pergantian-alat', 'color' => 'purple'],
            ['name' => 'Selesai', 'slug' => 'selesai', 'color' => 'emerald'],
            ['name' => 'Siap Diambil', 'slug' => 'siap-diambil', 'color' => 'emerald'],
            ['name' => 'Sudah Diambil', 'slug' => 'sudah-diambil', 'color' => 'slate'],
            ['name' => 'Dibatalkan', 'slug' => 'dibatalkan', 'color' => 'red'],
        ]));

        TransactionCategory::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Penjualan Laptop', 'slug' => 'penjualan-laptop', 'type' => 'income'],
            ['name' => 'Service Laptop', 'slug' => 'service-laptop', 'type' => 'income'],
            ['name' => 'Sparepart', 'slug' => 'sparepart', 'type' => 'income'],
            ['name' => 'Pembelian Stok Laptop', 'slug' => 'pembelian-stok-laptop', 'type' => 'expense'],
            ['name' => 'Operasional Toko', 'slug' => 'operasional-toko', 'type' => 'expense'],
            ['name' => 'Transport', 'slug' => 'transport', 'type' => 'expense'],
            ['name' => 'Marketing', 'slug' => 'marketing', 'type' => 'expense'],
            ['name' => 'Admin Marketplace', 'slug' => 'admin-marketplace', 'type' => 'expense'],
            ['name' => 'Lain-lain', 'slug' => 'lain-lain', 'type' => 'expense'],
        ]));

        PaymentMethod::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Tunai', 'slug' => 'tunai'],
            ['name' => 'Transfer Bank', 'slug' => 'transfer-bank'],
            ['name' => 'QRIS', 'slug' => 'qris'],
            ['name' => 'Kartu Kredit', 'slug' => 'kartu-kredit'],
            ['name' => 'Debit', 'slug' => 'debit'],
        ]));

        SparepartType::insert(array_map(fn($item) => $item + ['is_active' => true], [
            ['name' => 'Keyboard', 'slug' => 'keyboard'],
            ['name' => 'Layar', 'slug' => 'layar'],
            ['name' => 'Baterai', 'slug' => 'baterai'],
            ['name' => 'Charger', 'slug' => 'charger'],
            ['name' => 'RAM', 'slug' => 'ram'],
            ['name' => 'Storage', 'slug' => 'storage'],
            ['name' => 'Motherboard', 'slug' => 'motherboard'],
            ['name' => 'Fan/Heatsink', 'slug' => 'fan-heatsink'],
            ['name' => 'Port/Connector', 'slug' => 'port-connector'],
            ['name' => 'Casing', 'slug' => 'casing'],
            ['name' => 'Lainnya', 'slug' => 'lainnya'],
        ]));
    }
}
