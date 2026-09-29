---
name: TechCycle Top Navigation Specification
description: Spesifikasi teknis dan design token komponen Top Navigation Bar untuk TechCycle tanpa ikon keranjang, avatar profil, dan tombol konsultasi.
colors:
  background: "#F8F9FA"
  background-alpha: "rgba(248, 249, 250, 0.9)"
  border-hairline: "rgba(229, 231, 235, 0.7)"
  text-primary: "#111111"
  text-secondary: "#52525B"
  text-muted: "#71717A"
  brand-badge-bg: "#F4F4F5"
  brand-badge-border: "#E4E4E7"
  brand-badge-text: "#52525B"
  action-hover: "rgba(228, 228, 231, 0.7)"
typography:
  font-family: "Plus Jakarta Sans, Inter, sans-serif"
  brand:
    fontSize: "1.25rem"
    fontWeight: "700"
    letterSpacing: "-0.02em"
    lineHeight: "1.2"
  badge:
    fontSize: "0.625rem"
    fontWeight: "600"
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  nav-links:
    fontSize: "0.875rem"
    fontWeight: "600"
    letterSpacing: "-0.01em"
dimensions:
  height: "72px"
  max-width: "1280px"
  logo-symbol-size: "36px"
  search-button-size: "40px"
rounded:
  logo-symbol: "9999px"
  brand-badge: "9999px"
  search-button: "9999px"
---

## Overview
Komponen Top Navigation dirancang ultra-minimalis, bersih, dan fungsional[cite: 1]. Tata letak hanya memuat 3 elemen utama: Brand Logo (kiri), Navigation Menu Links (tengah), dan Search Trigger Button (kanan)[cite: 1, 2]. Seluruh elemen transaksional dan personalisasi (keranjang belanja, avatar akun, tombol CTA konsultasi) ditiadakan untuk menjaga tampilan tetap tenang dan tidak membebani pandangan pengguna[cite: 1].

## Structure & Layout
* **Positioning**: `sticky top-0 z-40`, menempel di bagian paling atas saat halaman digulir.
* **Canvas Effect**: Menggunakan efek *frosted glass* halus melalui `backdrop-filter: blur(12px)` berpadu dengan warna latar transparan `#F8F9FA/90`[cite: 1, 2].
* **Bottom Border**: Garis pembatas tipis 1px (`rgba(229, 231, 235, 0.7)`) untuk membedakan area navigasi dengan konten tanpa efek drop shadow[cite: 1, 2].
* **Horizontal Alignment**:
  * **Kiri**: Logo "TechCycle" dengan simbol monogram ⚡ berbentuk pill bulat dan teks penanda kecil "REFURBISHED".
  * **Tengah**: Menu navigasi horizontal yang responsif (`Layanan Kami`, `Katalog Pilihan`, `Standar Grade A+`, `Estimasi Servis`, `Testimoni`).
  * **Kanan**: Tombol pencarian tunggal berbentuk bulat (ikon search).

## Component Breakdown

### 1. Brand Logo (Left)
* Menggabungkan simbol visual bulat `36px` berlatar hitam pekat (`#111111`) dengan monogram petir putih (`#FFFFFF`)[cite: 1].
* Teks utama berukuran `20px` (*font-weight 700*) berdampingan dengan chip pill status "REFURBISHED" berukuran `10px` dengan border halus[cite: 1, 2].

### 2. Navigation Menu Links (Center)
* Tipografi: `14px`, *font-weight 600*, warna teks dasar `#52525B`[cite: 1, 2].
* State default: Teks abu-abu netral terdistribusi dengan spasi `gap-8`[cite: 1, 2].
* State hover: Transisi halus menuju hitam pekat (`#111111`) dalam `150ms ease-out`[cite: 1, 2].
* Mode responsif: Menu utama disembunyikan pada viewport mobile (`< 768px`) dan dialihkan ke drawer menu bila diperlukan[cite: 1, 2].

### 3. Search Action (Right)
* Tombol lingkaran berukuran `40x40px` dengan sudut membulat penuh (`rounded-full`)[cite: 1, 2].
* State default: Latar transparan dengan warna ikon stroke `#52525B`[cite: 1, 2].
* State hover: Latar berubah menjadi `rgba(228, 228, 231, 0.7)` tanpa outline atau shadow tebal[cite: 1, 2].

## Rules to Never Break
* Dilarang menampilkan ikon keranjang (cart), avatar akun pengguna, maupun tombol aksi konsultasi di dalam area navbar ini.
* Dilarang menggunakan shadow gelap pekat (elevation murni mengandalkan garis border hairline 1px dan efek blur latar belakang)[cite: 1, 2].
* Seluruh elemen interaktif wajib mempertahankan kontras teks minimal 4.5:1 untuk memenuhi standar aksesibilitas WCAG AA[cite: 1, 2].