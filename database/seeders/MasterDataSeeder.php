<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\RentalStatus;
use App\Models\ServiceStatus;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBySlug(Brand::class, [
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
        ]);

        $this->seedBySlug(Category::class, [
            ['name' => 'Ultrabook', 'slug' => 'ultrabook'],
            ['name' => 'Gaming', 'slug' => 'gaming'],
            ['name' => 'Business', 'slug' => 'business'],
            ['name' => 'Multimedia', 'slug' => 'multimedia'],
            ['name' => 'Entry Level', 'slug' => 'entry-level'],
            ['name' => 'Workstation', 'slug' => 'workstation'],
        ]);

        $this->seedBySlug(LaptopSource::class, [
            ['name' => 'Beli di Pegadaian', 'slug' => 'beli-di-pegadaian'],
            ['name' => 'Beli dari toko', 'slug' => 'beli-dari-toko'],
            ['name' => 'Beli dari customer', 'slug' => 'beli-dari-customer'],
            ['name' => 'Beli dari marketplace', 'slug' => 'beli-dari-marketplace'],
            ['name' => 'Tukar tambah', 'slug' => 'tukar-tambah'],
            ['name' => 'Supplier', 'slug' => 'supplier'],
            ['name' => 'Lainnya', 'slug' => 'lainnya'],
        ]);

        $this->seedBySlug(LaptopStatus::class, [
            ['name' => 'Draft', 'slug' => 'draft', 'color' => '#64748b'],
            ['name' => 'Tersedia', 'slug' => 'tersedia', 'color' => '#10b981'],
            ['name' => 'Booking', 'slug' => 'booking', 'color' => '#3b82f6'],
            ['name' => 'Terjual', 'slug' => 'terjual', 'color' => '#8b5cf6'],
            ['name' => 'Rusak', 'slug' => 'rusak', 'color' => '#ef4444'],
            ['name' => 'Disimpan', 'slug' => 'disimpan', 'color' => '#f59e0b'],
            ['name' => 'Disewa', 'slug' => 'disewa', 'color' => '#0ea5e9'],
        ]);

        $this->seedBySlug(RentalStatus::class, [
            ['name' => 'Dipesan', 'slug' => 'dipesan', 'color' => 'slate'],
            ['name' => 'Aktif Disewa', 'slug' => 'aktif-disewa', 'color' => 'blue'],
            ['name' => 'Selesai', 'slug' => 'selesai', 'color' => 'emerald'],
            ['name' => 'Sudah Kembali', 'slug' => 'sudah-kembali', 'color' => 'slate'],
            ['name' => 'Dibatalkan', 'slug' => 'dibatalkan', 'color' => 'red'],
        ]);

        $this->seedBySlug(ServiceStatus::class, [
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
        ]);

        $this->seedByTypeSlug(TransactionCategory::class, [
            ['name' => 'Penjualan Laptop', 'slug' => 'penjualan-laptop', 'type' => 'income'],
            ['name' => 'Service Laptop', 'slug' => 'service-laptop', 'type' => 'income'],
            ['name' => 'Sparepart', 'slug' => 'sparepart', 'type' => 'income'],
            ['name' => 'Sewa Laptop', 'slug' => 'sewa-laptop', 'type' => 'income'],
            ['name' => 'Denda Sewa', 'slug' => 'denda-sewa', 'type' => 'income'],
            ['name' => 'Penjualan Sparepart', 'slug' => 'penjualan-sparepart', 'type' => 'income'],
            ['name' => 'Pembelian Sparepart', 'slug' => 'pembelian-sparepart', 'type' => 'expense'],
            ['name' => 'Pembelian Stok Laptop', 'slug' => 'pembelian-stok-laptop', 'type' => 'expense'],
            ['name' => 'Operasional Toko', 'slug' => 'operasional-toko', 'type' => 'expense'],
            ['name' => 'Transport', 'slug' => 'transport', 'type' => 'expense'],
            ['name' => 'Marketing', 'slug' => 'marketing', 'type' => 'expense'],
            ['name' => 'Admin Marketplace', 'slug' => 'admin-marketplace', 'type' => 'expense'],
            ['name' => 'Lain-lain', 'slug' => 'lain-lain', 'type' => 'expense'],
        ]);

        // Slug 'cash' dipakai oleh PaymentMethod::defaultId() sebagai lookup
        // prioritas. Kalau nanti label diubah, pastikan slug tetap 'cash'.
        $this->seedBySlug(PaymentMethod::class, [
            ['name' => 'Tunai', 'slug' => 'cash'],
            ['name' => 'Transfer Bank', 'slug' => 'transfer-bank'],
            ['name' => 'QRIS', 'slug' => 'qris'],
            ['name' => 'Kartu Kredit', 'slug' => 'kartu-kredit'],
            ['name' => 'Debit', 'slug' => 'debit'],
        ]);

        $this->seedBySlug(SparepartType::class, [
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
        ]);
    }

    /**
     * Idempotent seed by unique `slug`.
     *
     * @param  class-string<Model>  $model
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function seedBySlug(string $model, array $rows): void
    {
        foreach ($rows as $row) {
            $model::query()->firstOrCreate(
                ['slug' => $row['slug']],
                $row + ['is_active' => true],
            );
        }
    }

    /**
     * Idempotent seed by composite unique (type, slug) — untuk
     * transaction_categories yang bisa punya slug sama di type berbeda.
     *
     * @param  class-string<Model>  $model
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function seedByTypeSlug(string $model, array $rows): void
    {
        foreach ($rows as $row) {
            $model::query()->firstOrCreate(
                ['type' => $row['type'], 'slug' => $row['slug']],
                $row + ['is_active' => true],
            );
        }
    }
}
