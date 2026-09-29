---
name: TechCycle Hero Section Specification
description: Spesifikasi teknis dan design token khusus komponen Hero Section untuk TechCycle, memadukan typography display berukuran besar, latar belakang suasana studio, dan floating pill search bar.
colors:
  hero-surface: "#18181B"
  hero-border: "#E5E7EB"
  overlay-top: "rgba(0, 0, 0, 0.4)"
  overlay-middle: "rgba(0, 0, 0, 0.35)"
  overlay-bottom: "rgba(0, 0, 0, 0.85)"
  text-display-start: "rgba(255, 255, 255, 0.96)"
  text-display-end: "rgba(255, 255, 255, 0.55)"
  text-tagline: "#E4E4E7"
  search-bg: "#FFFFFF"
  search-border: "rgba(229, 231, 235, 0.8)"
  search-text: "#111111"
  search-placeholder: "#A1A1AA"
  search-icon: "#A1A1AA"
  btn-search-bg: "#111111"
  btn-search-hover: "#27272A"
  btn-search-text: "#FFFFFF"
typography:
  font-family: "Plus Jakarta Sans, Inter, sans-serif"
  display-title:
    fontSize: "clamp(4.5rem, 11vw, 8.5rem)"
    fontWeight: "800"
    letterSpacing: "-0.04em"
    lineHeight: "0.9"
  tagline:
    fontSize: "0.9375rem"
    fontWeight: "500"
    lineHeight: "1.5"
  search-input:
    fontSize: "0.875rem"
    fontWeight: "500"
  search-button:
    fontSize: "0.875rem"
    fontWeight: "600"
dimensions:
  max-width-container: "1280px"
  height-mobile: "400px"
  height-tablet: "480px"
  height-desktop: "540px"
  search-max-width: "768px"
  search-overlap-offset: "-32px"
rounded:
  hero-container: "28px"
  search-pill: "9999px"
  search-button: "9999px"
elevation:
  floating-search: "0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)"
---

## Overview
Hero section berfungsi sebagai focal point visual utama dengan gaya *Minimalist Tech Editorial*. Tampilan ini menggabungkan kontainer kanvas bersudut tumpul besar, latar belakang foto studio workstation dengan overlay gelap bertingkat, tipografi display bertopeng (*masked gradient text*), serta bilah pencarian mengambang (*floating pill search*) yang tumpang-tindih (*overlap*) di batas bawah kontainer.

## Visual & Structural Hierarchy

### 1. Canvas Container
* **Wrapper Dimensions**: Lebar maksimal `1280px` (`max-w-7xl`) dengan margin terpusat dan padding horizontal responsif (`px-4 sm:px-6 lg:px-8`).
* **Frame Radius**: Sudut melengkung `28px` (`rounded-[28px]`) dengan border hairline tipis `1px solid #E5E7EB`.
* **Imagery & Overlay**:
  * Menggunakan gambar interior meja kerja / workstation laptop dengan saturasi tenang dan posisi terpusat (`object-cover object-center`).
  * Lapisan gradien vertikal dari atas ke bawah: `rgba(0,0,0,0.4)` di bagian atas, `rgba(0,0,0,0.35)` di tengah, dan `rgba(0,0,0,0.85)` di batas bawah untuk memastikan keterbacaan teks dan transisi kontras ke bilah pencarian.

### 2. Typography & Copywriting
* **Masked Display Title**:
  * Teks utama ("Shop" atau "TechCycle") menggunakan teknik CSS background clip:
    ```css
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.55) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    ```
  * Karakter tipografi: Sangat rapat (`letterSpacing: -0.04em`), ekstra tebal (*weight 800*), dengan skala responsif `clamp(4.5rem, 11vw, 8.5rem)`.
* **Tagline**:
  * Warna teks `#E4E4E7` dengan lebar pembacaan maksimal `max-w-xl`.
  * Menjelaskan nilai produk secara ringkas tanpa elemen badge/pill dekoratif tambahan yang menumpuk di atasnya.

### 3. Floating Pill Search Bar
* **Positioning**: Ditempatkan mengambang tepat di perbatasan bawah kontainer hero menggunakan margin negatif `margin-top: -32px` (`-mt-8`) dan `z-index: 20`.
* **Container Structure**:
  * Bentuk kapsul penuh (`border-radius: 9999px`).
  * Latar belakang putih solid (`#FFFFFF`) dengan border halus 1px (`rgba(229, 231, 235, 0.8)`).
  * Padding internal: `8px 8px 8px 24px`.
  * Elevasi: Bayangan lembut menyebar luas tanpa garis keras (`0 12px 32px -4px rgba(0, 0, 0, 0.08)`).
* **Input Field**:
  * Ikon pencarian di sisi kiri dengan ukuran `20px` dan stroke color `#A1A1AA`.
  * Bidang teks transparan tanpa border default atau outline fokus yang mengganggu (`focus:outline-none`).
  * Placeholder teks berkarakter abu-abu netral (`#A1A1AA`).
* **Submit Action Button**:
  * Tombol aksi berbentuk *full pill* (`rounded-full`) dengan warna dasar hitam pekat (`#111111`).
  * Padding: `12px 24px` di desktop (`px-6 py-3`).
  * Tipografi: Teks putih (`#FFFFFF`), ukuran `14px`, *font-weight 600*.
  * State hover: Transisi halus menuju `#27272A` dalam durasi `150ms`.

## Rules to Never Break
* Dilarang menambahkan badge dekoratif, label stok mengambang, atau chip promosi di dalam area kanvas hero agar fokus visual tipografi tetap tenang dan minimalis.
* Bilah pencarian harus mempertahankan bentuk kapsul penuh (*full pill*) dan wajib tumpang-tindih (*overlap*) separuh badan pada garis bawah kontainer hero.
* Masked gradient pada teks display tidak boleh diganti menjadi teks putih solid murni tanpa transparansi, agar kedalaman visual dengan gambar latar belakang tetap terjaga.
* Dilarang menggunakan shadow hitam pekat pada bilah pencarian; elevasi harus tetap lembut dan menyebar alami.