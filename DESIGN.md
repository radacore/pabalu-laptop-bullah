---
name: TechCycle Design System
description: Design system minimalis dan bersih untuk platform jual beli laptop bekas, sewa laptop, dan servis perangkat keras.
colors:
  primary: "#111111"
  primary-hover: "#262626"
  secondary: "#71717A"
  background: "#F8F9FA"
  surface: "#FFFFFF"
  surface-media: "#F1F3F5"
  surface-dark: "#1E1F22"
  text-primary: "#111111"
  text-secondary: "#71717A"
  text-inverted: "#FFFFFF"
  border: "#E5E7EB"
  accent-badge: "#FF4D4D"
  rating-star: "#F59E0B"
  success: "#10B981"
typography:
  font-family: "Plus Jakarta Sans, Inter, sans-serif"
  display:
    fontSize: "6.5rem"
    fontWeight: "800"
    lineHeight: "0.95"
    letterSpacing: "-0.04em"
  h2:
    fontSize: "2rem"
    fontWeight: "700"
    lineHeight: "1.25"
    letterSpacing: "-0.02em"
  h3:
    fontSize: "1.25rem"
    fontWeight: "600"
    lineHeight: "1.3"
  product-title:
    fontSize: "1rem"
    fontWeight: "600"
    lineHeight: "1.35"
  body-base:
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "1.6"
  caption:
    fontSize: "0.75rem"
    fontWeight: "500"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "64px"
  3xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverted}"
    rounded: "{rounded.full}"
    padding: "10px 22px"
    fontSize: "0.875rem"
    fontWeight: "600"
  button-secondary:
    backgroundColor: "transparent"
    border: "1px solid {colors.border}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "10px 18px"
    fontSize: "0.875rem"
    fontWeight: "600"
  card:
    backgroundColor: "{colors.surface}"
    mediaBackground: "{colors.surface-media}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.lg}"
  floating-search:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "8px 8px 8px 24px"
    elevation: "0 12px 32px -4px rgba(0, 0, 0, 0.08)"
---

## Overview
TechCycle menggabungkan estetika *clean e-commerce* dengan kejelasan informasi perangkat *refurbished* dan layanan servis[cite: 1]. Pendekatan visual berfokus pada tipografi *oversized*, latar kanvas netral, kontainer media abu-abu lembut tanpa distraksi, serta tombol aksi *pill-shaped* kontras tinggi[cite: 1].

## Colors
* **Primary (`#111111`)**: Aksi utama (tombol beli/sewa, pencarian, dan container callout banner)[cite: 1, 2].
* **Background (`#F8F9FA`)**: Kanvas utama yang memberikan suasana lapang dan bersih[cite: 1, 2].
* **Surface Media (`#F1F3F5`)**: Container visual untuk foto hardware laptop agar detail fisik terlihat jelas dan terisolasi[cite: 1, 2].
* **Text Primary (`#111111`)**: Keterbacaan tinggi dengan rasio kontras melebihi standar WCAG AAA[cite: 1, 2].
* **Text Secondary (`#71717A`)**: Penanda spesifikasi perangkat, detail garansi, dan metadata[cite: 1, 2].
* **Accent & Star (`#FF4D4D`, `#F59E0B`)**: Penanda kuota/promo penting dan rating kepuasan pelanggan[cite: 1, 2].

## Typography
* **Font Family**: Plus Jakarta Sans atau Inter untuk seluruh elemen tampilan[cite: 1, 2].
* **Display Hero**: Tipografi judul ekstra besar dengan efek masked transparan di atas gambar hero suasana studio[cite: 1, 2].
* **Tabular Figures**: Digunakan untuk harga, kapasitas RAM/SSD, dan hitungan unit agar pembandingan visual tetap sejajar[cite: 2].

## Layout & Spacing
* **Sistem Spacing**: Kelipatan 8px grid[cite: 1, 2].
* **Container**: Lebar maksimum `1440px` terpusat dengan padding samping responsif[cite: 1, 2].
* **Hero Search**: Bilah pencarian berbentuk kapsul diletakkan mengambang (*overlap*) pada batas bawah container hero banner[cite: 1, 2].

## Shapes & Elevation
* **Pill Shape (`9999px`)**: Digunakan konsisten untuk tombol aksi, filter chip, badge, input pencarian, dan tautan navigasi sekunder[cite: 1, 2].
* **Border Radius (`20px - 24px`)**: Diterapkan pada kartu produk, kontainer media gambar, dan banner utama[cite: 1, 2].
* **Depth**: Mengutamakan pemisahan tonal (*tonal elevation*) dan garis border tipis 1px (`#E5E7EB`), dengan bayangan lembut hanya pada bilah pencarian mengambang[cite: 1, 2].

## Rules to Never Break
* Dilarang menggunakan shadow gelap pekat atau border hitam tebal bergaya neubrutalisme[cite: 1, 2].
* Tombol CTA utama wajib mempertahankan format *full pill* dengan warna hitam pekat (`#111111`)[cite: 1, 2].
* Seluruh foto unit laptop harus berada di dalam container media abu-abu (`#F1F3F5`) berlatar belakang bersih atau transparan[cite: 1, 2].
* Hindari penambahan badge dekoratif yang menumpuk di atas banner judul utama agar visual tetap tenang dan minimalis[cite: 1].