# PRD — Pabalu Laptop

## 1. Ringkasan Produk

**Pabalu Laptop** adalah aplikasi internal untuk mengelola bisnis penjualan laptop bekas dan layanan service laptop. Aplikasi ini membantu admin dan tim operasional mencatat stok laptop bekas, detail spesifikasi, sumber pembelian, foto unit, harga modal, harga jual, status penjualan, serta proses service/pergantian komponen.

Aplikasi juga menyediakan akses khusus untuk pelanggan agar dapat memantau status pengerjaan service laptop melalui akun yang dibuatkan oleh admin atau melalui link unik service.

Selain operasional penjualan dan service, aplikasi memiliki fitur **accounting dan cashflow** untuk mencatat pemasukan, pengeluaran, modal pembelian, pendapatan service, biaya sparepart, laba/rugi, dan arus kas bisnis.

---

## 2. Tujuan Produk

1. Mempermudah pencatatan dan manajemen stok laptop bekas.
2. Mempermudah pencatatan sumber laptop, harga modal, harga jual, dan status penjualan.
3. Memungkinkan pelanggan melakukan tracking status service laptop.
4. Mengelola proses service, pergantian alat/komponen, estimasi biaya, dan status pengerjaan.
5. Menyediakan pencatatan accounting dan cashflow bisnis.
6. Mengurangi pencatatan manual menggunakan buku, spreadsheet, atau chat terpisah.
7. Memberikan dashboard ringkas untuk melihat performa penjualan, service, stok, dan keuangan.

---

## 3. Target Pengguna

### 3.1 Admin
Admin memiliki akses penuh untuk mengelola sistem, user, data laptop, service, transaksi, accounting, dan laporan.

### 3.2 Staff / Teknisi
Staff atau teknisi dapat mengelola data service, update status pengerjaan, mencatat pergantian komponen, menambahkan catatan teknis, dan mengunggah foto pendukung.

### 3.3 Customer / User
Customer adalah pelanggan yang laptopnya sedang diservice atau pernah melakukan transaksi. Customer tidak dapat melakukan registrasi sendiri. Akun customer dibuatkan oleh admin.

Customer dapat login menggunakan **nomor telepon dan password** untuk melihat status service laptop miliknya.

---

## 4. Teknologi yang Digunakan

### 4.1 Stack Utama

- **Backend:** Laravel 12, PHP ^8.2
- **Frontend:** Inertia.js v2 + React 19 + TypeScript 5
- **Styling:** TailwindCSS v4, Inter Font
- **Database:** MySQL `db_pabalu_laptop`
- **State Management:** Zustand 5
- **I18n Server:** `mcamara/laravel-localization`
- **I18n Client:** `i18next` + `react-i18next`
- **Testing:** Pest PHP 4

### 4.2 Arsitektur Umum

Aplikasi menggunakan Laravel sebagai backend utama, Inertia.js sebagai penghubung antara backend dan frontend, serta React TypeScript sebagai antarmuka pengguna. Database menggunakan MySQL untuk menyimpan seluruh data operasional, transaksi, dan keuangan.

---

## 5. Scope Produk

### 5.1 Termasuk Dalam Scope

- Login user menggunakan nomor telepon dan password.
- Tidak ada fitur registrasi mandiri untuk customer.
- Admin dapat membuat akun customer.
- Manajemen role dan permission.
- Manajemen data laptop bekas.
- Manajemen foto laptop.
- Manajemen spesifikasi laptop.
- Manajemen sumber laptop.
- Manajemen harga modal dan harga jual.
- Status laptop: tersedia, terjual, disimpan, rusak, atau status custom lain.
- Laptop yang sudah terjual tidak tampil di katalog/listing penjualan aktif.
- Manajemen service laptop.
- Link unik untuk tracking service customer.
- Update status pengerjaan service.
- Catatan pergantian alat/komponen.
- Estimasi biaya service.
- Pencatatan transaksi penjualan dan service.
- Accounting sederhana.
- Cashflow pemasukan dan pengeluaran.
- Dashboard admin.
- Laporan penjualan, service, stok, dan keuangan.

### 5.2 Tidak Termasuk Dalam Scope Awal

- Registrasi customer mandiri.
- Marketplace publik penuh seperti Tokopedia/Shopee.
- Integrasi payment gateway.
- Integrasi ekspedisi.
- Mobile app native.
- Multi cabang kompleks.
- Sistem payroll karyawan.

Fitur di luar scope dapat dikembangkan pada fase berikutnya.

---

## 6. Role dan Hak Akses

## 6.1 Admin

Admin dapat:

- Login ke dashboard.
- Membuat, mengubah, dan menghapus akun user/customer.
- Mengelola role staff/teknisi.
- Mengelola data laptop bekas.
- Mengelola data service.
- Mengelola transaksi penjualan.
- Mengelola transaksi service.
- Mengelola accounting dan cashflow.
- Melihat seluruh laporan.
- Mengatur master data.

## 6.2 Staff / Teknisi

Staff atau teknisi dapat:

- Melihat daftar service yang ditugaskan.
- Mengubah status pengerjaan service.
- Menambahkan catatan teknis.
- Menambahkan data pergantian sparepart/alat.
- Mengunggah foto kondisi laptop.
- Melihat detail customer terkait service.

Akses staff dapat dibatasi sesuai kebutuhan.

## 6.3 Customer

Customer dapat:

- Login menggunakan nomor telepon dan password.
- Melihat daftar service miliknya.
- Melihat status pengerjaan service.
- Melihat estimasi biaya service.
- Melihat riwayat update service.
- Mengakses halaman tracking melalui link unik.

Customer tidak dapat:

- Registrasi sendiri.
- Melihat data customer lain.
- Mengubah status service.
- Mengubah data transaksi.
- Mengakses dashboard admin.

---

## 7. Autentikasi dan Akun

### 7.1 Login

User login menggunakan:

- Nomor telepon
- Password

Nomor telepon menjadi identifier utama untuk customer.

### 7.2 Registrasi

Tidak tersedia fitur registrasi mandiri.

Semua akun customer dibuatkan oleh admin melalui dashboard.

### 7.3 Pembuatan Akun Customer

Admin dapat membuat akun customer dengan data:

- Nama customer
- Nomor telepon
- Password awal
- Alamat, opsional
- Catatan customer, opsional

Setelah akun dibuat, customer dapat login menggunakan nomor telepon dan password.

### 7.4 Reset Password

Admin dapat melakukan reset password customer apabila customer lupa password.

---

## 8. Modul Dashboard

Dashboard admin menampilkan ringkasan bisnis, seperti:

- Total laptop tersedia.
- Total laptop terjual.
- Total laptop masuk bulan ini.
- Total service aktif.
- Total service selesai.
- Total pemasukan bulan ini.
- Total pengeluaran bulan ini.
- Estimasi laba penjualan.
- Estimasi laba service.
- Cashflow bersih.
- Laptop yang stoknya tersedia.
- Service yang sedang berjalan.
- Service yang menunggu konfirmasi customer.

---

## 9. Modul Penjualan Laptop Bekas

### 9.1 Tujuan Modul

Modul ini digunakan untuk mencatat dan mengelola laptop bekas yang dibeli untuk dijual kembali.

### 9.2 Data Laptop

Setiap laptop memiliki data:

- Kode laptop / SKU
- Nama laptop
- Brand
- Tipe / seri
- Kategori
- Sumber laptop
- Tanggal pembelian
- Harga modal
- Harga jual
- Status laptop
- Deskripsi kondisi
- Catatan internal
- Foto-foto laptop
- Spesifikasi lengkap
- Tanggal terjual, jika sudah terjual
- Customer pembeli, opsional

### 9.3 Sumber Laptop

Sumber laptop bersifat fleksibel dan dapat diinput manual.

Contoh sumber laptop:

- Beli di Pegadaian
- Beli dari toko
- Beli dari customer
- Beli dari marketplace
- Tukar tambah
- Supplier
- Lainnya

Sistem perlu menyediakan master data sumber laptop agar admin dapat menambah sumber baru sesuai kebutuhan.

### 9.4 Foto Laptop

Admin dapat mengunggah beberapa foto untuk setiap laptop.

Foto yang dapat diunggah:

- Foto tampak depan
- Foto tampak belakang
- Foto keyboard
- Foto layar
- Foto port
- Foto kerusakan/minus
- Foto kelengkapan
- Foto bebas lainnya

### 9.5 Spesifikasi Laptop

Spesifikasi laptop meliputi:

- Processor
- RAM
- Storage
- GPU/VGA
- Ukuran layar
- Resolusi layar
- Kondisi baterai
- Keyboard
- Touchpad
- Webcam
- Speaker
- Port
- Sistem operasi
- Kelengkapan charger
- Kelengkapan dus
- Serial number, opsional
- Garansi, opsional
- Catatan minus

Spesifikasi dibuat fleksibel agar dapat disesuaikan dengan kondisi unit.

### 9.6 Harga Modal dan Harga Jual

Setiap laptop wajib memiliki:

- Harga modal
- Harga jual

Sistem dapat menghitung estimasi laba:

```text
Estimasi Laba = Harga Jual - Harga Modal - Biaya Tambahan
```

Biaya tambahan dapat berupa:

- Biaya service sebelum dijual
- Biaya sparepart
- Biaya transport
- Biaya admin
- Biaya lain-lain

### 9.7 Status Laptop

Status default:

- Draft
- Tersedia
- Booking
- Terjual
- Rusak
- Disimpan

Jika status laptop diubah menjadi **Terjual**, maka laptop tidak akan tampil lagi pada daftar laptop tersedia atau katalog penjualan aktif.

### 9.8 Filter dan Pencarian Laptop

Admin dapat mencari dan memfilter laptop berdasarkan:

- Nama laptop
- Brand
- Tipe
- Sumber laptop
- Status
- Range harga modal
- Range harga jual
- Tanggal pembelian
- Tanggal terjual
- Processor
- RAM
- Storage

---

## 10. Modul Service Laptop

### 10.1 Tujuan Modul

Modul service digunakan untuk mencatat laptop customer yang masuk untuk diperbaiki, memantau status pengerjaan, mencatat pergantian alat/komponen, dan memberikan akses tracking kepada customer.

### 10.2 Data Service

Setiap service memiliki data:

- Nomor service / kode tiket
- Customer
- Nomor telepon customer
- Nama laptop
- Brand
- Tipe laptop
- Serial number, opsional
- Keluhan customer
- Kondisi awal laptop
- Foto kondisi awal
- Estimasi biaya
- Estimasi waktu pengerjaan
- Status service
- Teknisi penanggung jawab
- Catatan teknisi
- Sparepart/pergantian alat
- Total biaya service
- Status pembayaran
- Link unik tracking
- Tanggal masuk
- Tanggal selesai
- Tanggal diambil customer

### 10.3 Link Unik Tracking Service

Setiap service memiliki link unik yang dapat dibagikan kepada customer.

Contoh format:

```text
/service-tracking/{unique_code}
```

Melalui link ini, customer dapat melihat status pengerjaan tanpa harus mencari manual.

Akses link unik dapat dibuat dengan dua opsi:

1. Publik terbatas: siapa pun yang memiliki link dapat melihat status dasar service.
2. Login required: customer harus login terlebih dahulu menggunakan nomor telepon dan password.

Rekomendasi awal: link unik menampilkan informasi terbatas, sedangkan detail lengkap hanya tampil setelah customer login.

### 10.4 Status Service

Status default service:

- Diterima
- Dicek teknisi
- Menunggu konfirmasi customer
- Dalam pengerjaan
- Menunggu sparepart
- Pergantian alat
- Selesai
- Siap diambil
- Sudah diambil
- Dibatalkan

Status dapat dikembangkan sesuai flow operasional Pabalu Laptop.

### 10.5 Riwayat Update Service

Setiap perubahan status harus tersimpan sebagai histori.

Data histori:

- Service ID
- Status lama
- Status baru
- Catatan update
- User yang mengupdate
- Waktu update

Customer dapat melihat timeline status service.

### 10.6 Pergantian Alat / Sparepart

Jika ada pergantian alat, teknisi/admin dapat mencatat:

- Nama sparepart
- Jenis sparepart
- Jumlah
- Harga modal sparepart
- Harga jual sparepart
- Biaya pemasangan
- Catatan
- Foto sparepart, opsional

Biaya pergantian alat dapat otomatis masuk ke total biaya service dan cashflow.

### 10.7 Foto Service

Foto yang dapat diunggah:

- Foto kondisi awal laptop
- Foto kerusakan
- Foto proses pengerjaan
- Foto sparepart lama
- Foto sparepart baru
- Foto setelah selesai

---

## 11. Modul Customer Tracking

### 11.1 Tujuan

Memberikan transparansi kepada customer terkait proses service laptop.

### 11.2 Fitur Customer

Customer dapat melihat:

- Nomor service
- Nama laptop
- Keluhan
- Status saat ini
- Timeline pengerjaan
- Estimasi biaya
- Estimasi waktu selesai
- Catatan dari teknisi/admin
- Informasi pergantian alat, jika ada
- Total biaya akhir
- Status pembayaran

### 11.3 Tampilan Timeline

Contoh timeline:

```text
01 Juni 2026 10:00 — Service diterima
01 Juni 2026 14:00 — Sedang dicek teknisi
02 Juni 2026 09:00 — Menunggu konfirmasi pergantian keyboard
02 Juni 2026 13:00 — Customer menyetujui pergantian keyboard
03 Juni 2026 16:00 — Service selesai
```

---

## 12. Modul Accounting dan Cashflow

### 12.1 Tujuan Modul

Modul accounting dan cashflow digunakan untuk mencatat arus kas masuk dan keluar dari aktivitas bisnis Pabalu Laptop.

### 12.2 Jenis Transaksi Keuangan

Transaksi keuangan meliputi:

- Pemasukan penjualan laptop
- Pemasukan service
- Pemasukan pergantian sparepart
- Pengeluaran pembelian laptop bekas
- Pengeluaran pembelian sparepart
- Pengeluaran operasional
- Pengeluaran transport
- Pengeluaran admin
- Pengeluaran lain-lain

### 12.3 Cashflow

Cashflow menampilkan:

- Total kas masuk
- Total kas keluar
- Saldo akhir
- Cashflow harian
- Cashflow mingguan
- Cashflow bulanan
- Cashflow berdasarkan kategori

### 12.4 Kategori Transaksi

Kategori transaksi fleksibel dan dapat dikelola oleh admin.

Contoh kategori:

- Penjualan laptop
- Service laptop
- Sparepart
- Pembelian stok laptop
- Operasional toko
- Transport
- Marketing
- Admin marketplace
- Lain-lain

### 12.5 Relasi Accounting dengan Modul Lain

#### Penjualan Laptop
Saat laptop dijual, sistem dapat membuat transaksi pemasukan otomatis berdasarkan harga jual.

#### Pembelian Laptop
Saat laptop baru dicatat dengan harga modal, sistem dapat membuat transaksi pengeluaran otomatis.

#### Service Laptop
Saat service selesai dan dibayar, sistem dapat membuat transaksi pemasukan otomatis.

#### Sparepart
Saat sparepart digunakan untuk service, sistem dapat mencatat biaya modal sparepart dan pendapatan dari customer.

### 12.6 Laporan Laba Rugi Sederhana

Sistem dapat menghitung:

```text
Laba Penjualan Laptop = Harga Jual - Harga Modal - Biaya Tambahan
Laba Service = Pendapatan Service - Biaya Sparepart - Biaya Operasional Terkait
Laba Bersih = Total Pemasukan - Total Pengeluaran
```

---

## 13. Modul Laporan

### 13.1 Laporan Penjualan

Menampilkan:

- Total laptop terjual
- Total omzet penjualan
- Total modal laptop terjual
- Total laba kotor
- Laptop terlaris berdasarkan brand/tipe
- Penjualan berdasarkan periode

### 13.2 Laporan Service

Menampilkan:

- Total service masuk
- Total service selesai
- Total service aktif
- Service dibatalkan
- Rata-rata durasi pengerjaan
- Pendapatan service
- Sparepart yang sering digunakan

### 13.3 Laporan Stok Laptop

Menampilkan:

- Laptop tersedia
- Laptop booking
- Laptop terjual
- Laptop rusak
- Nilai modal stok tersedia
- Estimasi nilai jual stok tersedia

### 13.4 Laporan Keuangan

Menampilkan:

- Total pemasukan
- Total pengeluaran
- Saldo kas
- Laba/rugi
- Cashflow per periode
- Transaksi berdasarkan kategori

---

## 14. Master Data

Master data yang perlu tersedia:

- Brand laptop
- Kategori laptop
- Sumber laptop
- Status laptop
- Status service
- Kategori transaksi
- Metode pembayaran
- Jenis sparepart
- Role user

Master data dibuat fleksibel agar admin dapat menyesuaikan flow bisnis tanpa perlu perubahan kode besar.

---

## 15. Struktur Data Awal

### 15.1 Users

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| name | string | Nama user |
| phone | string | Nomor telepon untuk login |
| password | string | Password terenkripsi |
| role | string | admin, staff, technician, customer |
| is_active | boolean | Status akun |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diperbarui |

### 15.2 Customers

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| user_id | bigint | Relasi ke users |
| name | string | Nama customer |
| phone | string | Nomor telepon |
| address | text | Alamat |
| note | text | Catatan |

### 15.3 Laptops

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| sku | string | Kode laptop |
| name | string | Nama laptop |
| brand | string | Brand |
| model | string | Tipe/seri |
| source | string | Sumber laptop |
| purchase_date | date | Tanggal pembelian |
| cost_price | decimal | Harga modal |
| selling_price | decimal | Harga jual |
| additional_cost | decimal | Biaya tambahan |
| status | string | Status laptop |
| description | text | Deskripsi |
| internal_note | text | Catatan internal |
| sold_at | timestamp | Waktu terjual |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diperbarui |

### 15.4 Laptop Specifications

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| laptop_id | bigint | Relasi ke laptops |
| processor | string | Processor |
| ram | string | RAM |
| storage | string | Storage |
| gpu | string | VGA/GPU |
| screen_size | string | Ukuran layar |
| screen_resolution | string | Resolusi |
| battery_condition | string | Kondisi baterai |
| os | string | Sistem operasi |
| accessories | text | Kelengkapan |
| minus_note | text | Catatan minus |

### 15.5 Laptop Photos

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| laptop_id | bigint | Relasi ke laptops |
| file_path | string | Path foto |
| caption | string | Keterangan foto |
| sort_order | integer | Urutan foto |

### 15.6 Services

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| service_code | string | Nomor service |
| customer_id | bigint | Relasi customer |
| device_name | string | Nama laptop |
| brand | string | Brand laptop |
| model | string | Tipe laptop |
| serial_number | string | Serial number |
| complaint | text | Keluhan customer |
| initial_condition | text | Kondisi awal |
| estimated_cost | decimal | Estimasi biaya |
| final_cost | decimal | Biaya akhir |
| estimated_completion_date | date | Estimasi selesai |
| status | string | Status service |
| technician_id | bigint | Teknisi |
| tracking_code | string | Kode unik tracking |
| payment_status | string | unpaid, partial, paid |
| received_at | timestamp | Tanggal masuk |
| completed_at | timestamp | Tanggal selesai |
| picked_up_at | timestamp | Tanggal diambil |

### 15.7 Service Updates

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| service_id | bigint | Relasi service |
| old_status | string | Status sebelumnya |
| new_status | string | Status baru |
| note | text | Catatan update |
| created_by | bigint | User yang update |
| created_at | timestamp | Waktu update |

### 15.8 Service Parts

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| service_id | bigint | Relasi service |
| part_name | string | Nama sparepart |
| quantity | integer | Jumlah |
| cost_price | decimal | Harga modal |
| selling_price | decimal | Harga jual |
| installation_fee | decimal | Biaya pemasangan |
| note | text | Catatan |

### 15.9 Financial Transactions

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | Primary key |
| transaction_code | string | Kode transaksi |
| type | string | income / expense |
| category | string | Kategori transaksi |
| amount | decimal | Nominal |
| payment_method | string | Metode pembayaran |
| transaction_date | date | Tanggal transaksi |
| description | text | Keterangan |
| related_type | string | laptop_sale, service, sparepart, manual |
| related_id | bigint | ID data terkait |
| created_by | bigint | User pembuat |

---

## 16. User Flow

### 16.1 Flow Admin Menambahkan Laptop Bekas

1. Admin login.
2. Admin masuk ke menu Laptop Bekas.
3. Admin klik Tambah Laptop.
4. Admin mengisi data laptop, sumber laptop, harga modal, harga jual, dan spesifikasi.
5. Admin mengunggah foto laptop.
6. Admin menyimpan data.
7. Laptop tampil di daftar stok jika statusnya tersedia.
8. Jika laptop dijual, admin mengubah status menjadi terjual.
9. Laptop tidak tampil lagi di daftar laptop tersedia.
10. Sistem mencatat transaksi pemasukan penjualan.

### 16.2 Flow Admin Membuat Service

1. Admin login.
2. Admin masuk ke menu Service.
3. Admin pilih customer atau membuat customer baru.
4. Admin mengisi data laptop customer dan keluhan.
5. Sistem membuat nomor service dan link unik tracking.
6. Admin/teknisi mengupdate status pengerjaan.
7. Customer dapat melihat status melalui akun atau link unik.
8. Jika ada pergantian alat, teknisi mencatat sparepart.
9. Setelah selesai, admin mengubah status menjadi selesai/siap diambil.
10. Setelah pembayaran, sistem mencatat pemasukan service.

### 16.3 Flow Customer Tracking Service

1. Customer menerima link unik tracking service.
2. Customer membuka link.
3. Customer melihat status dasar service.
4. Jika diperlukan, customer login menggunakan nomor telepon dan password.
5. Customer melihat detail service, timeline, estimasi biaya, dan status pembayaran.

---

## 17. Halaman Utama Aplikasi

### 17.1 Admin Panel

- Dashboard
- User & Customer
- Laptop Bekas
- Tambah Laptop
- Detail Laptop
- Service
- Tambah Service
- Detail Service
- Sparepart / Pergantian Alat
- Transaksi
- Cashflow
- Accounting
- Laporan
- Master Data
- Pengaturan

### 17.2 Customer Panel

- Login Customer
- Dashboard Customer
- Daftar Service Saya
- Detail Service
- Timeline Service
- Profil Saya

### 17.3 Public / Tracking Page

- Halaman tracking service via link unik
- Menampilkan status dasar service
- Tombol login untuk melihat detail lengkap

---

## 18. Requirement UI/UX

### 18.1 Umum

- Tampilan bersih dan mudah digunakan.
- Responsive untuk desktop, tablet, dan mobile browser.
- Menggunakan TailwindCSS v4.
- Menggunakan font Inter.
- Akses admin diutamakan untuk desktop.
- Akses customer tracking harus nyaman digunakan di mobile.

### 18.2 Dashboard

Dashboard harus menampilkan angka ringkas dalam card, grafik sederhana, dan daftar aktivitas terbaru.

### 18.3 Laptop Bekas

Daftar laptop menggunakan tampilan table/grid dengan foto utama, nama laptop, spesifikasi singkat, harga jual, harga modal, estimasi laba, dan status.

### 18.4 Service Tracking

Tampilan customer harus sederhana, dengan highlight status utama dan timeline pengerjaan.

---

## 19. Requirement Non-Fungsional

### 19.1 Keamanan

- Password harus di-hash.
- Customer hanya dapat melihat data miliknya sendiri.
- Admin/staff memiliki akses sesuai role.
- Link tracking menggunakan kode unik yang sulit ditebak.
- Validasi input wajib di backend dan frontend.
- File upload harus dibatasi tipe dan ukuran file.

### 19.2 Performa

- Pagination untuk daftar laptop, service, customer, dan transaksi.
- Optimasi query untuk dashboard dan laporan.
- Kompresi gambar atau resize foto laptop/service.

### 19.3 Audit Trail

Sistem sebaiknya mencatat:

- User yang membuat data.
- User yang mengubah data.
- Perubahan status service.
- Perubahan status laptop.
- Transaksi keuangan yang dibuat otomatis/manual.

### 19.4 Backup

Database dan file foto perlu memiliki strategi backup berkala.

---

## 20. Testing Requirement

Testing menggunakan Pest PHP 4.

Prioritas test:

- Login menggunakan nomor telepon dan password.
- Admin dapat membuat customer.
- Customer tidak dapat registrasi sendiri.
- Admin dapat membuat laptop bekas.
- Laptop terjual tidak tampil di daftar tersedia.
- Admin dapat membuat service.
- Link tracking service dapat diakses.
- Customer hanya dapat melihat service miliknya.
- Status service tersimpan dalam histori.
- Transaksi keuangan otomatis tercatat saat penjualan/service selesai.
- Cashflow menghitung pemasukan dan pengeluaran dengan benar.

---

## 21. MVP Fase 1

Fase 1 fokus pada fitur inti operasional.

### 21.1 Fitur MVP

- Login admin/staff/customer menggunakan nomor telepon dan password.
- Manajemen user/customer oleh admin.
- Manajemen laptop bekas.
- Upload foto laptop.
- Input spesifikasi laptop.
- Input sumber laptop.
- Harga modal dan harga jual.
- Status laptop tersedia/terjual.
- Manajemen service laptop.
- Tracking service via link unik.
- Customer login dan melihat service miliknya.
- Update status service.
- Histori status service.
- Catatan pergantian sparepart sederhana.
- Cashflow sederhana: pemasukan dan pengeluaran.
- Dashboard ringkas.

---

## 22. Pengembangan Fase 2

Fitur lanjutan yang dapat dikembangkan:

- Laporan laba rugi lebih detail.
- Manajemen stok sparepart.
- Cetak invoice/nota.
- Cetak tanda terima service.
- Notifikasi WhatsApp.
- Reminder service selesai.
- Export laporan ke Excel/PDF.
- Multi cabang.
- Approval transaksi keuangan.
- Integrasi payment gateway.
- Integrasi katalog publik.

---

## 23. Acceptance Criteria

Aplikasi dianggap memenuhi kebutuhan awal apabila:

1. Admin dapat login dan mengelola data user/customer.
2. Customer tidak dapat melakukan registrasi sendiri.
3. Customer dapat login menggunakan nomor telepon dan password.
4. Admin dapat mencatat laptop bekas lengkap dengan sumber, foto, spesifikasi, harga modal, dan harga jual.
5. Laptop dengan status terjual tidak muncul di daftar laptop tersedia.
6. Admin dapat membuat data service dan menghasilkan link unik tracking.
7. Customer dapat melihat status service melalui akun atau link unik.
8. Teknisi/admin dapat mengupdate status service dan histori tersimpan.
9. Pergantian alat/sparepart dapat dicatat pada service.
10. Transaksi pemasukan dan pengeluaran dapat dicatat.
11. Cashflow dapat menampilkan total kas masuk, kas keluar, dan saldo.
12. Dashboard menampilkan ringkasan data utama.

---

## 24. Risiko dan Catatan

### 24.1 Risiko

- Flow service di lapangan bisa berubah, sehingga status service harus fleksibel.
- Format spesifikasi laptop bisa berbeda-beda, sehingga form perlu dibuat cukup dinamis.
- Accounting dapat berkembang menjadi kompleks, sehingga MVP sebaiknya fokus pada cashflow sederhana terlebih dahulu.
- Link tracking harus aman agar data customer tidak mudah diakses sembarang orang.

### 24.2 Catatan Implementasi

- Gunakan UUID atau random token untuk tracking code.
- Nomor telepon perlu distandarisasi formatnya.
- Foto laptop dan service sebaiknya disimpan di storage terstruktur.
- Role dan permission sebaiknya dibuat sejak awal agar mudah dikembangkan.
- Status laptop dan status service sebaiknya dibuat sebagai master data agar fleksibel.

---

## 25. Kesimpulan

Pabalu Laptop adalah aplikasi manajemen operasional untuk bisnis laptop bekas dan service laptop. Fokus utama aplikasi adalah membantu admin mengelola stok laptop, mencatat service, memberikan tracking kepada customer, dan memantau cashflow bisnis.

MVP sebaiknya difokuskan pada manajemen laptop bekas, service tracking, akun customer tanpa registrasi mandiri, serta cashflow sederhana. Setelah fitur inti stabil, aplikasi dapat dikembangkan ke laporan lanjutan, invoice, notifikasi WhatsApp, stok sparepart, dan integrasi lain.
