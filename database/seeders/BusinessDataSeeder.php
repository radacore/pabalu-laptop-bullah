<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopSpecification;
use App\Models\Service;
use App\Models\ServicePart;
use App\Models\ServiceUpdate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BusinessDataSeeder extends Seeder
{
    private int $adminId;
    private int $teknisiId;

    public function run(): void
    {
        $this->adminId = User::where('role', 'admin')->first()->id;
        $this->teknisiId = User::where('role', 'staff')->first()->id;

        $this->seedCustomers();
        $this->seedLaptops();
        $this->seedServices();
        $this->seedFinancialTransactions();
    }

    private function seedCustomers(): void
    {
        $customers = [
            ['name' => 'Budi Santoso', 'phone' => '081234567001', 'address' => 'Jl. Merdeka No. 10, Jakarta Pusat'],
            ['name' => 'Siti Rahmawati', 'phone' => '081234567002', 'address' => 'Jl. Sudirman No. 25, Jakarta Selatan'],
            ['name' => 'Ahmad Hidayat', 'phone' => '081234567003', 'address' => 'Jl. Gatot Subroto No. 5, Jakarta Timur'],
            ['name' => 'Dewi Lestari', 'phone' => '081234567004', 'address' => 'Jl. Pahlawan No. 15, Bandung'],
            ['name' => 'Rudi Hermawan', 'phone' => '081234567005', 'address' => 'Jl. Diponegoro No. 8, Surabaya'],
            ['name' => 'Rina Wijaya', 'phone' => '081234567006', 'address' => 'Jl. Gajah Mada No. 3, Yogyakarta'],
            ['name' => 'Hendra Gunawan', 'phone' => '081234567007', 'address' => 'Jl. MT Haryono No. 12, Semarang'],
            ['name' => 'Nina Permatasari', 'phone' => '081234567008', 'address' => 'Jl. Siliwangi No. 7, Makassar'],
            ['name' => 'Agus Prabowo', 'phone' => '081234567009', 'address' => 'Jl. Ahmad Yani No. 20, Medan'],
            ['name' => 'Fitri Handayani', 'phone' => '081234567010', 'address' => 'Jl. Teuku Umar No. 4, Denpasar'],
            ['name' => 'Doni Prasetyo', 'phone' => '081234567011', 'address' => 'Jl. Pemuda No. 30, Malang'],
            ['name' => 'Mega Safitri', 'phone' => '081234567012', 'address' => 'Jl. Veteran No. 18, Palembang'],
            ['name' => 'Yoga Permana', 'phone' => '081234567013', 'address' => 'Jl. Jend. Sudirman No. 45, Bogor'],
            ['name' => 'Indah Kusuma', 'phone' => '081234567014', 'address' => 'Jl. Asia Afrika No. 9, Bandung'],
            ['name' => 'Eko Prasetyo', 'phone' => '081234567015', 'address' => 'Jl. Kaliurang No. 6, Yogyakarta'],
        ];

        foreach ($customers as $data) {
            $nameParts = explode(' ', $data['name']);
            $firstName = $nameParts[0];

            $user = User::firstOrCreate(
                ['phone' => $data['phone']],
                [
                    'name' => $data['name'],
                    'email' => strtolower($firstName) . '@gmail.com',
                    'password' => bcrypt('password'),
                    'role' => 'customer',
                    'is_active' => true,
                ]
            );

            Customer::firstOrCreate(
                ['phone' => $data['phone']],
                [
                    'user_id' => $user->id,
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'note' => null,
                ]
            );
        }

        $this->command?->info('15 customers seeded.');
    }

    private function seedLaptops(): void
    {
        $laptops = [
            [
                'sku' => 'PBL-2406-001', 'name' => 'MacBook Pro M3 14"', 'brand' => 'Apple',
                'model' => 'MacBook Pro M3 2024', 'laptop_source_id' => 2, 'purchase_date' => '2026-04-15',
                'cost_price' => 17500000, 'selling_price' => 19999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'Apple M3', 'ram' => '16GB Unified', 'storage' => '512GB SSD',
                    'display' => '14" Liquid Retina XDR', 'graphics' => 'Apple M3 Integrated',
                    'operating_system' => 'macOS Sequoia', 'battery' => '70Wh', 'condition' => 'Like New'],
            ],
            [
                'sku' => 'PBL-2406-002', 'name' => 'ASUS ROG Zephyrus G14', 'brand' => 'Asus',
                'model' => 'GA403UV', 'laptop_source_id' => 1, 'purchase_date' => '2026-04-20',
                'cost_price' => 18500000, 'selling_price' => 21999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'AMD Ryzen 9 8945HS', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe',
                    'display' => '14" QHD+ 165Hz', 'graphics' => 'NVIDIA RTX 4060 8GB',
                    'operating_system' => 'Windows 11 Pro', 'battery' => '76Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-003', 'name' => 'Dell XPS 15', 'brand' => 'Dell',
                'model' => 'XPS 9530', 'laptop_source_id' => 3, 'purchase_date' => '2026-05-01',
                'cost_price' => 14000000, 'selling_price' => 15999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'Intel Core i7-13700H', 'ram' => '16GB DDR5', 'storage' => '512GB SSD',
                    'display' => '15.6" OLED 3.5K', 'graphics' => 'Intel Iris Xe',
                    'operating_system' => 'Windows 11 Pro', 'battery' => '86Wh', 'condition' => 'Bekas - Mulus'],
            ],
            [
                'sku' => 'PBL-2406-004', 'name' => 'Lenovo ThinkPad X1 Carbon', 'brand' => 'Lenovo',
                'model' => 'Gen 11', 'laptop_source_id' => 4, 'purchase_date' => '2026-05-05',
                'cost_price' => 12000000, 'selling_price' => 13999000, 'laptop_status_id' => 4,
                'sold_at' => '2026-05-20',
                'specs' => ['processor' => 'Intel Core i5-1345U', 'ram' => '16GB LPDDR5', 'storage' => '512GB SSD',
                    'display' => '14" WUXGA IPS', 'graphics' => 'Intel Iris Xe',
                    'operating_system' => 'Windows 11 Pro', 'battery' => '57Wh', 'condition' => 'Bekas - Bagus'],
            ],
            [
                'sku' => 'PBL-2406-005', 'name' => 'HP Pavilion Aero 13', 'brand' => 'HP',
                'model' => '13-bg0000', 'laptop_source_id' => 5, 'purchase_date' => '2026-05-08',
                'cost_price' => 7000000, 'selling_price' => 8999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'AMD Ryzen 5 7535U', 'ram' => '8GB DDR5', 'storage' => '512GB SSD',
                    'display' => '13.3" WQXGA IPS', 'graphics' => 'AMD Radeon 660M',
                    'operating_system' => 'Windows 11 Home', 'battery' => '43Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-006', 'name' => 'Acer Swift Go 14', 'brand' => 'Acer',
                'model' => 'SFG14-72', 'laptop_source_id' => 6, 'purchase_date' => '2026-05-10',
                'cost_price' => 8000000, 'selling_price' => 9999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'Intel Core i5-13500H', 'ram' => '16GB LPDDR5', 'storage' => '512GB SSD',
                    'display' => '14" 2.2K IPS', 'graphics' => 'Intel Iris Xe',
                    'operating_system' => 'Windows 11 Home', 'battery' => '65Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-007', 'name' => 'MSI Stealth 16 Studio', 'brand' => 'MSI',
                'model' => 'A13VG', 'laptop_source_id' => 2, 'purchase_date' => '2026-05-12',
                'cost_price' => 22000000, 'selling_price' => 25999000, 'laptop_status_id' => 1,
                'specs' => ['processor' => 'Intel Core i9-13900H', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe',
                    'display' => '16" QHD+ 240Hz OLED', 'graphics' => 'NVIDIA RTX 4070 8GB',
                    'operating_system' => 'Windows 11 Pro', 'battery' => '99.9Wh', 'condition' => 'Baru Segel'],
            ],
            [
                'sku' => 'PBL-2406-008', 'name' => 'Samsung Galaxy Book3 Pro', 'brand' => 'Samsung',
                'model' => 'NP960XFH', 'laptop_source_id' => 1, 'purchase_date' => '2026-05-15',
                'cost_price' => 13000000, 'selling_price' => 14999000, 'laptop_status_id' => 3,
                'specs' => ['processor' => 'Intel Core i7-1360P', 'ram' => '16GB LPDDR5', 'storage' => '512GB SSD',
                    'display' => '16" AMOLED 3K', 'graphics' => 'Intel Iris Xe',
                    'operating_system' => 'Windows 11 Home', 'battery' => '76Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-009', 'name' => 'Xiaomi Book Air 13', 'brand' => 'Xiaomi',
                'model' => '2024 Edition', 'laptop_source_id' => 4, 'purchase_date' => '2026-05-18',
                'cost_price' => 6500000, 'selling_price' => 7999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'Intel Core i5-1230U', 'ram' => '16GB LPDDR5', 'storage' => '512GB SSD',
                    'display' => '13.3" 2.8K OLED', 'graphics' => 'Intel Iris Xe',
                    'operating_system' => 'Windows 11 Home', 'battery' => '58.3Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-010', 'name' => 'Lenovo Legion Pro 5', 'brand' => 'Lenovo',
                'model' => '16ARX8', 'laptop_source_id' => 6, 'purchase_date' => '2026-05-20',
                'cost_price' => 19500000, 'selling_price' => 22999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'AMD Ryzen 7 7745HX', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe',
                    'display' => '16" WQXGA IPS 240Hz', 'graphics' => 'NVIDIA RTX 4060 8GB',
                    'operating_system' => 'Windows 11 Pro', 'battery' => '80Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-011', 'name' => 'Apple MacBook Air M2', 'brand' => 'Apple',
                'model' => 'MacBook Air M2 2023', 'laptop_source_id' => 3, 'purchase_date' => '2026-05-22',
                'cost_price' => 10000000, 'selling_price' => 12999000, 'laptop_status_id' => 4,
                'sold_at' => '2026-06-01',
                'specs' => ['processor' => 'Apple M2', 'ram' => '8GB Unified', 'storage' => '256GB SSD',
                    'display' => '13.6" Liquid Retina', 'graphics' => 'Apple M2 Integrated',
                    'operating_system' => 'macOS Sequoia', 'battery' => '52.6Wh', 'condition' => 'Bekas - Mulus'],
            ],
            [
                'sku' => 'PBL-2406-012', 'name' => 'ASUS TUF Gaming F15', 'brand' => 'Asus',
                'model' => 'FX507ZI', 'laptop_source_id' => 1, 'purchase_date' => '2026-05-25',
                'cost_price' => 11500000, 'selling_price' => 13999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'Intel Core i7-12700H', 'ram' => '16GB DDR5', 'storage' => '512GB SSD',
                    'display' => '15.6" FHD 144Hz', 'graphics' => 'NVIDIA RTX 3060 6GB',
                    'operating_system' => 'Windows 11 Home', 'battery' => '56Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-013', 'name' => 'Dell Inspiron 16', 'brand' => 'Dell',
                'model' => '5635', 'laptop_source_id' => 5, 'purchase_date' => '2026-05-28',
                'cost_price' => 8000000, 'selling_price' => 9999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'AMD Ryzen 7 7730U', 'ram' => '16GB DDR4', 'storage' => '512GB SSD',
                    'display' => '16" WUXGA IPS', 'graphics' => 'AMD Radeon Graphics',
                    'operating_system' => 'Windows 11 Home', 'battery' => '54Wh', 'condition' => 'Baru'],
            ],
            [
                'sku' => 'PBL-2406-014', 'name' => 'HP Notebook 15', 'brand' => 'HP',
                'model' => '15-fc0000', 'laptop_source_id' => 6, 'purchase_date' => '2026-06-01',
                'cost_price' => 5000000, 'selling_price' => 6499000, 'laptop_status_id' => 6,
                'specs' => ['processor' => 'Intel Celeron N4500', 'ram' => '4GB DDR4', 'storage' => '256GB SSD',
                    'display' => '15.6" HD SVA', 'graphics' => 'Intel UHD Graphics',
                    'operating_system' => 'Windows 11 Home', 'battery' => '41Wh', 'condition' => 'Baru - Diskon'],
            ],
            [
                'sku' => 'PBL-2406-015', 'name' => 'Apple MacBook Pro M4 Pro', 'brand' => 'Apple',
                'model' => 'MacBook Pro M4 Pro 2025', 'laptop_source_id' => 2, 'purchase_date' => '2026-06-03',
                'cost_price' => 25000000, 'selling_price' => 28999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'Apple M4 Pro', 'ram' => '24GB Unified', 'storage' => '1TB SSD',
                    'display' => '16.2" Liquid Retina XDR', 'graphics' => 'Apple M4 Pro Integrated',
                    'operating_system' => 'macOS Sequoia', 'battery' => '100Wh', 'condition' => 'Baru Segel'],
            ],
            [
                'sku' => 'PBL-2406-016', 'name' => 'Acer Predator Helios Neo 16', 'brand' => 'Acer',
                'model' => 'PHN16-72', 'laptop_source_id' => 4, 'purchase_date' => '2026-06-04',
                'cost_price' => 17000000, 'selling_price' => 19999000, 'laptop_status_id' => 2,
                'specs' => ['processor' => 'Intel Core i7-14650HX', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe',
                    'display' => '16" WQXGA IPS 165Hz', 'graphics' => 'NVIDIA RTX 4060 8GB',
                    'operating_system' => 'Windows 11 Home', 'battery' => '76Wh', 'condition' => 'Baru'],
            ],
        ];

        foreach ($laptops as $data) {
            $specs = $data['specs'];
            unset($data['specs']);

            $laptop = Laptop::firstOrCreate(
                ['sku' => $data['sku']],
                [
                    ...$data,
                    'additional_cost' => 0,
                    'description' => null,
                    'created_by' => $this->adminId,
                ]
            );

            LaptopSpecification::firstOrCreate(
                ['laptop_id' => $laptop->id],
                $specs
            );
        }

        $this->command?->info('16 laptops seeded.');
    }

    private function seedServices(): void
    {
        $services = [
            [
                'service_code' => 'SRV-2406-001', 'customer_id' => 1,
                'device_name' => 'ASUS ROG GL503', 'brand' => 'Asus', 'model' => 'GL503GE',
                'serial_number' => 'AS-2024-001', 'complaint' => 'Laptop sering mati sendiri saat dipakai gaming',
                'initial_condition' => 'Kipas berisik, thermal paste kering, suhu CPU 95°C saat idle',
                'estimated_cost' => 350000, 'final_cost' => 450000,
                'estimated_completion_date' => '2026-06-06', 'service_status_id' => 7,
                'tracking_code' => 'a1b2c3d4', 'technician_id' => $this->teknisiId, 'payment_status' => 'paid',
                'received_at' => '2026-06-01 10:00:00', 'completed_at' => '2026-06-03 15:00:00',
                'picked_up_at' => '2026-06-04 09:00:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-002', 'customer_id' => 2,
                'device_name' => 'HP Pavilion 14', 'brand' => 'HP', 'model' => '14-dv2000',
                'serial_number' => 'HP-2024-002', 'complaint' => 'Layar retak setelah terjatuh',
                'initial_condition' => 'Layar LCD pecah di pojok kiri bawah, touchpad tidak berfungsi',
                'estimated_cost' => 800000, 'final_cost' => 1200000,
                'estimated_completion_date' => '2026-06-07', 'service_status_id' => 4,
                'tracking_code' => 'e5f6g7h8', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-02 09:30:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-003', 'customer_id' => 3,
                'device_name' => 'Lenovo ThinkPad T480', 'brand' => 'Lenovo', 'model' => 'T480',
                'serial_number' => 'LN-2024-003', 'complaint' => 'Baterai cepat habis, hanya tahan 30 menit',
                'initial_condition' => 'Baterai swollen, kapasitas tersisa 15% dari original',
                'estimated_cost' => 500000,
                'estimated_completion_date' => '2026-06-08', 'service_status_id' => 5,
                'tracking_code' => 'i9j0k1l2', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-02 14:00:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-004', 'customer_id' => 4,
                'device_name' => 'Dell Latitude 7490', 'brand' => 'Dell', 'model' => 'Latitude 7490',
                'serial_number' => 'DL-2024-004', 'complaint' => 'Tidak bisa booting, muncul blue screen',
                'initial_condition' => 'BSOD error IRQL_NOT_LESS_OR_EQUAL, kemungkinan RAM atau driver',
                'estimated_cost' => 250000, 'final_cost' => 350000,
                'estimated_completion_date' => '2026-06-05', 'service_status_id' => 7,
                'tracking_code' => 'm3n4o5p6', 'technician_id' => $this->teknisiId, 'payment_status' => 'paid',
                'received_at' => '2026-06-01 11:00:00', 'completed_at' => '2026-06-02 16:00:00',
                'picked_up_at' => '2026-06-04 10:00:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-005', 'customer_id' => 5,
                'device_name' => 'MacBook Pro 2019', 'brand' => 'Apple', 'model' => 'A1989',
                'serial_number' => 'AP-2024-005', 'complaint' => 'Keyboard beberapa tombol tidak berfungsi',
                'initial_condition' => 'Keyboard butterfly, tombol A, S, D, Spasi macet',
                'estimated_cost' => 1500000,
                'estimated_completion_date' => '2026-06-10', 'service_status_id' => 1,
                'tracking_code' => 'q7r8s9t0', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-03 08:00:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-006', 'customer_id' => 6,
                'device_name' => 'Acer Swift 3', 'brand' => 'Acer', 'model' => 'SF314-511',
                'serial_number' => 'AC-2024-006', 'complaint' => 'Laptop lemot dan sering hang',
                'initial_condition' => 'HDD bad sector, RAM 4GB tidak cukup untuk Windows 11',
                'estimated_cost' => 700000, 'final_cost' => 950000,
                'estimated_completion_date' => '2026-06-08', 'service_status_id' => 8,
                'tracking_code' => 'u1v2w3x4', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-01 13:00:00', 'completed_at' => '2026-06-04 11:00:00',
                'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-007', 'customer_id' => 7,
                'device_name' => 'MSI GF63 Thin', 'brand' => 'MSI', 'model' => 'GF63 12UC',
                'serial_number' => 'MS-2024-007', 'complaint' => 'Overheat saat gaming, suhu GPU 90°C',
                'initial_condition' => 'Thermal paste kering, fan clogged dengan debu',
                'estimated_cost' => 300000, 'final_cost' => 300000,
                'estimated_completion_date' => '2026-06-06', 'service_status_id' => 7,
                'tracking_code' => 'y5z6a7b8', 'technician_id' => $this->teknisiId, 'payment_status' => 'paid',
                'received_at' => '2026-06-02 10:00:00', 'completed_at' => '2026-06-03 14:00:00',
                'picked_up_at' => '2026-06-04 08:00:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-008', 'customer_id' => 8,
                'device_name' => 'Samsung Galaxy Book2', 'brand' => 'Samsung', 'model' => 'NP750XED',
                'serial_number' => 'SM-2024-008', 'complaint' => 'USB port tidak terdeteksi',
                'initial_condition' => 'Port USB kendor, kemungkinan solder retak',
                'estimated_cost' => 200000,
                'estimated_completion_date' => '2026-06-09', 'service_status_id' => 2,
                'tracking_code' => 'c9d0e1f2', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-03 09:00:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-009', 'customer_id' => 9,
                'device_name' => 'ASUS VivoBook 15', 'brand' => 'Asus', 'model' => 'X513EA',
                'serial_number' => 'AS-2024-009', 'complaint' => 'Layar berkedip-kedip',
                'initial_condition' => 'Flexible cable LCD rusak, display intermittent',
                'estimated_cost' => 600000,
                'estimated_completion_date' => '2026-06-10', 'service_status_id' => 4,
                'tracking_code' => 'g3h4i5j6', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-03 10:30:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-010', 'customer_id' => 10,
                'device_name' => 'MacBook Air M1', 'brand' => 'Apple', 'model' => 'A2337',
                'serial_number' => 'AP-2024-010', 'complaint' => 'Baterai mengembung, touchpad tidak bisa diklik',
                'initial_condition' => 'Baterai swollen, trackpad terangkat, trackpad tidak responsif',
                'estimated_cost' => 1200000,
                'estimated_completion_date' => '2026-06-11', 'service_status_id' => 5,
                'tracking_code' => 'k7l8m9n0', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-03 14:00:00', 'created_by' => $this->adminId,
            ],
            [
                'service_code' => 'SRV-2406-011', 'customer_id' => 11,
                'device_name' => 'HP ENVY 13', 'brand' => 'HP', 'model' => '13-ba1000',
                'serial_number' => 'HP-2024-011', 'complaint' => 'Laptop terkena air minum, tidak mau nyala',
                'initial_condition' => 'Keyboard korosi, kemungkinan korslet di area keyboard',
                'estimated_cost' => 2000000,
                'estimated_completion_date' => '2026-06-14', 'service_status_id' => 1,
                'tracking_code' => 'o1p2q3r4', 'technician_id' => $this->teknisiId, 'payment_status' => 'unpaid',
                'received_at' => '2026-06-04 08:30:00', 'created_by' => $this->adminId,
            ],
        ];

        foreach ($services as $data) {
            $service = Service::firstOrCreate(
                ['service_code' => $data['service_code']],
                $data
            );

            // Create initial status update
            ServiceUpdate::firstOrCreate(
                ['service_id' => $service->id, 'new_status' => 'Diterima'],
                [
                    'old_status' => null,
                    'new_status' => 'Diterima',
                    'note' => 'Service diterima dari customer.',
                    'created_by' => $this->adminId,
                    'created_at' => Carbon::parse($service->received_at),
                ]
            );

            // Create follow-up updates based on current status
            if ($service->service_status_id >= 2) {
                ServiceUpdate::firstOrCreate(
                    ['service_id' => $service->id, 'new_status' => 'Dicek Teknisi'],
                    [
                        'old_status' => 'Diterima',
                        'new_status' => 'Dicek Teknisi',
                        'note' => 'Teknisi sedang mengecek kerusakan.',
                        'created_by' => $this->teknisiId,
                        'created_at' => Carbon::parse($service->received_at)->addHours(2),
                    ]
                );
            }

            if ($service->service_status_id >= 4) {
                ServiceUpdate::firstOrCreate(
                    ['service_id' => $service->id, 'new_status' => 'Dalam Pengerjaan'],
                    [
                        'old_status' => 'Dicek Teknisi',
                        'new_status' => 'Dalam Pengerjaan',
                        'note' => 'Memulai perbaikan sesuai diagnosa.',
                        'created_by' => $this->teknisiId,
                        'created_at' => Carbon::parse($service->received_at)->addDay(),
                    ]
                );
            }

            if ($service->service_status_id >= 7) {
                ServiceUpdate::firstOrCreate(
                    ['service_id' => $service->id, 'new_status' => 'Selesai'],
                    [
                        'old_status' => 'Dalam Pengerjaan',
                        'new_status' => 'Selesai',
                        'note' => 'Perbaikan selesai, siap diambil.',
                        'created_by' => $this->teknisiId,
                        'created_at' => Carbon::parse($service->completed_at),
                    ]
                );
            }

            if ($service->service_status_id >= 8) {
                ServiceUpdate::firstOrCreate(
                    ['service_id' => $service->id, 'new_status' => 'Siap Diambil'],
                    [
                        'old_status' => 'Selesai',
                        'new_status' => 'Siap Diambil',
                        'note' => 'Laptop siap diambil customer.',
                        'created_by' => $this->adminId,
                        'created_at' => Carbon::parse($service->completed_at)->addHours(1),
                    ]
                );
            }

            if ($service->service_status_id >= 9) {
                ServiceUpdate::firstOrCreate(
                    ['service_id' => $service->id, 'new_status' => 'Sudah Diambil'],
                    [
                        'old_status' => 'Siap Diambil',
                        'new_status' => 'Sudah Diambil',
                        'note' => 'Laptop sudah diambil oleh customer.',
                        'created_by' => $this->adminId,
                        'created_at' => Carbon::parse($service->picked_up_at),
                    ]
                );
            }

            // Add spare parts for services that use them
            $parts = match ($service->service_code) {
                'SRV-2406-001' => [
                    ['sparepart_type_id' => 8, 'part_name' => 'Thermal Paste Arctic MX-6', 'quantity' => 1, 'cost_price' => 80000, 'selling_price' => 150000, 'installation_fee' => 100000],
                    ['sparepart_type_id' => 8, 'part_name' => 'Cooling Fan ASUS ROG', 'quantity' => 1, 'cost_price' => 200000, 'selling_price' => 350000, 'installation_fee' => 100000],
                ],
                'SRV-2406-002' => [
                    ['sparepart_type_id' => 2, 'part_name' => 'LCD HP Pavilion 14" FHD', 'quantity' => 1, 'cost_price' => 550000, 'selling_price' => 900000, 'installation_fee' => 200000],
                    ['sparepart_type_id' => 9, 'part_name' => 'Touchpad Cable HP', 'quantity' => 1, 'cost_price' => 75000, 'selling_price' => 150000, 'installation_fee' => 50000],
                ],
                'SRV-2406-003' => [
                    ['sparepart_type_id' => 3, 'part_name' => 'Baterai Lenovo ThinkPad T480', 'quantity' => 1, 'cost_price' => 350000, 'selling_price' => 550000, 'installation_fee' => 100000],
                ],
                'SRV-2406-004' => [
                    ['sparepart_type_id' => 5, 'part_name' => 'RAM DDR4 8GB SODIMM', 'quantity' => 1, 'cost_price' => 200000, 'selling_price' => 350000, 'installation_fee' => 50000],
                ],
                'SRV-2406-006' => [
                    ['sparepart_type_id' => 6, 'part_name' => 'SSD NVMe 512GB', 'quantity' => 1, 'cost_price' => 350000, 'selling_price' => 550000, 'installation_fee' => 100000],
                    ['sparepart_type_id' => 5, 'part_name' => 'RAM DDR4 8GB SODIMM', 'quantity' => 1, 'cost_price' => 200000, 'selling_price' => 350000, 'installation_fee' => 50000],
                ],
                'SRV-2406-007' => [
                    ['sparepart_type_id' => 8, 'part_name' => 'Thermal Paste', 'quantity' => 1, 'cost_price' => 80000, 'selling_price' => 150000, 'installation_fee' => 100000],
                ],
                default => [],
            };

            foreach ($parts as $partData) {
                ServicePart::firstOrCreate(
                    ['service_id' => $service->id, 'part_name' => $partData['part_name']],
                    $partData
                );

                // Create financial transaction for each part usage (expense for cost_price)
                FinancialTransaction::firstOrCreate(
                    ['transaction_code' => 'EXP-' . $service->service_code . '-' . str_replace(' ', '-', $partData['part_name'])],
                    [
                        'type' => 'expense',
                        'transaction_category_id' => 3,
                        'amount' => $partData['cost_price'] * $partData['quantity'],
                        'payment_method_id' => 1,
                        'transaction_date' => Carbon::parse($service->received_at)->format('Y-m-d'),
                        'description' => 'Pembelian ' . $partData['part_name'] . ' untuk ' . $service->service_code,
                        'created_by' => $this->adminId,
                    ]
                );
            }

            // Create financial transaction for service income if completed
            if (in_array($service->service_status_id, [7, 8, 9]) && $service->final_cost) {
                FinancialTransaction::firstOrCreate(
                    ['transaction_code' => 'INC-' . $service->service_code],
                    [
                        'type' => 'income',
                        'transaction_category_id' => 2,
                        'amount' => $service->final_cost,
                        'payment_method_id' => $service->payment_status === 'paid' ? 1 : null,
                        'transaction_date' => Carbon::parse($service->picked_up_at ?? $service->completed_at ?? $service->received_at)->format('Y-m-d'),
                        'description' => 'Pembayaran service ' . $service->service_code . ' - ' . $service->device_name,
                        'related_type' => 'service',
                        'related_id' => $service->id,
                        'created_by' => $this->adminId,
                    ]
                );
            }
        }

        $this->command?->info('11 services with updates and parts seeded.');
    }

    private function seedFinancialTransactions(): void
    {
        $transactions = [
            // Income from laptop sales
            ['type' => 'income', 'transaction_category_id' => 1, 'amount' => 13999000,
                'payment_method_id' => 2, 'transaction_date' => '2026-05-20',
                'description' => 'Penjualan Lenovo ThinkPad X1 Carbon ke customer'],
            ['type' => 'income', 'transaction_category_id' => 1, 'amount' => 12999000,
                'payment_method_id' => 1, 'transaction_date' => '2026-06-01',
                'description' => 'Penjualan MacBook Air M2 ke customer'],
            ['type' => 'income', 'transaction_category_id' => 1, 'amount' => 19999000,
                'payment_method_id' => 2, 'transaction_date' => '2026-06-02',
                'description' => 'Penjualan MacBook Pro M3 ke customer'],
            ['type' => 'income', 'transaction_category_id' => 1, 'amount' => 21999000,
                'payment_method_id' => 3, 'transaction_date' => '2026-06-03',
                'description' => 'Penjualan ASUS ROG Zephyrus ke customer'],

            // Expense: Laptop purchases
            ['type' => 'expense', 'transaction_category_id' => 4, 'amount' => 17500000,
                'payment_method_id' => 2, 'transaction_date' => '2026-04-15',
                'description' => 'Pembelian MacBook Pro M3 dari toko'],
            ['type' => 'expense', 'transaction_category_id' => 4, 'amount' => 18500000,
                'payment_method_id' => 2, 'transaction_date' => '2026-04-20',
                'description' => 'Pembelian ASUS ROG Zephyrus dari Pegadaian'],
            ['type' => 'expense', 'transaction_category_id' => 4, 'amount' => 14000000,
                'payment_method_id' => 1, 'transaction_date' => '2026-05-01',
                'description' => 'Pembelian Dell XPS 15 dari customer'],
            ['type' => 'expense', 'transaction_category_id' => 4, 'amount' => 19500000,
                'payment_method_id' => 2, 'transaction_date' => '2026-05-20',
                'description' => 'Pembelian Lenovo Legion Pro 5 dari supplier'],
            ['type' => 'expense', 'transaction_category_id' => 4, 'amount' => 25000000,
                'payment_method_id' => 3, 'transaction_date' => '2026-06-03',
                'description' => 'Pembelian MacBook Pro M4 Pro dari toko'],
            ['type' => 'expense', 'transaction_category_id' => 4, 'amount' => 17000000,
                'payment_method_id' => 2, 'transaction_date' => '2026-06-04',
                'description' => 'Pembelian Acer Predator Helios dari marketplace'],

            // Operational expenses
            ['type' => 'expense', 'transaction_category_id' => 5, 'amount' => 1500000,
                'payment_method_id' => 1, 'transaction_date' => '2026-05-01',
                'description' => 'Sewa tempat toko bulan Mei 2026'],
            ['type' => 'expense', 'transaction_category_id' => 5, 'amount' => 1500000,
                'payment_method_id' => 1, 'transaction_date' => '2026-06-01',
                'description' => 'Sewa tempat toko bulan Juni 2026'],
            ['type' => 'expense', 'transaction_category_id' => 5, 'amount' => 750000,
                'payment_method_id' => 2, 'transaction_date' => '2026-05-05',
                'description' => 'Listrik dan internet bulan April'],
            ['type' => 'expense', 'transaction_category_id' => 5, 'amount' => 850000,
                'payment_method_id' => 2, 'transaction_date' => '2026-06-03',
                'description' => 'Listrik dan internet bulan Mei'],

            // Transport
            ['type' => 'expense', 'transaction_category_id' => 6, 'amount' => 150000,
                'payment_method_id' => 1, 'transaction_date' => '2026-05-08',
                'description' => 'Transport ambil laptop dari customer'],
            ['type' => 'expense', 'transaction_category_id' => 6, 'amount' => 200000,
                'payment_method_id' => 1, 'transaction_date' => '2026-05-22',
                'description' => 'Transport kirim laptop ke supplier'],

            // Marketing
            ['type' => 'expense', 'transaction_category_id' => 7, 'amount' => 200000,
                'payment_method_id' => 3, 'transaction_date' => '2026-05-10',
                'description' => 'Facebook Ads promo laptop'],
            ['type' => 'expense', 'transaction_category_id' => 7, 'amount' => 150000,
                'payment_method_id' => 3, 'transaction_date' => '2026-06-02',
                'description' => 'Instagram Ads promo service'],

            // Marketplace admin fees
            ['type' => 'expense', 'transaction_category_id' => 8, 'amount' => 250000,
                'payment_method_id' => 3, 'transaction_date' => '2026-05-25',
                'description' => 'Admin fee Tokopedia penjualan Lenovo'],
            ['type' => 'expense', 'transaction_category_id' => 8, 'amount' => 350000,
                'payment_method_id' => 3, 'transaction_date' => '2026-06-02',
                'description' => 'Admin fee Shopee penjualan MacBook Air'],
        ];

        foreach ($transactions as $data) {
            $code = ($data['type'] === 'income' ? 'INC' : 'EXP') . '-' . now()->format('ymd') . '-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);

            FinancialTransaction::firstOrCreate(
                ['transaction_code' => $code],
                [
                    ...$data,
                    'transaction_code' => $code,
                    'created_by' => $this->adminId,
                ]
            );
        }

        $this->command?->info('21 financial transactions seeded.');
    }
}
