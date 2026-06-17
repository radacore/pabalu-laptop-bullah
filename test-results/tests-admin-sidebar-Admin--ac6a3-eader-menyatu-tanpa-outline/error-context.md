# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/admin-sidebar.spec.js >> Admin Sidebar & Header Integration >> sidebar dan header menyatu tanpa outline
- Location: tests/admin-sidebar.spec.js:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav.fixed.left-0').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('nav.fixed.left-0').first()

```

```yaml
- complementary:
  - img
  - paragraph: Pabalu Admin
  - paragraph: Portal Manajemen Internal
  - heading "Kelola bisnis laptop Anda dengan percaya diri." [level=1]
  - paragraph: Pantau inventaris, lacak servis, dan kelola transaksi keuangan — semuanya dalam satu tempat.
  - list:
    - listitem:
      - img
      - paragraph: Manajemen Inventaris
      - paragraph: Stok laptop baru dan bekas dengan foto, spesifikasi, dan status real-time.
    - listitem:
      - img
      - paragraph: Layanan Servis
      - paragraph: Tiket servis, sparepart, dan timeline update untuk setiap pelanggan.
    - listitem:
      - img
      - paragraph: Pencatatan Keuangan
      - paragraph: Pemasukan, pengeluaran, dan laporan laba-rugi otomatis.
  - img
  - paragraph: Akses aman untuk personel yang berwenang. Semua aktivitas dipantau dan dienkripsi.
- main:
  - link "Beranda":
    - /url: /
    - img
    - text: Beranda
  - heading "Selamat datang kembali" [level=2]
  - paragraph: Masuk untuk mengakses dashboard admin Anda.
  - text: Alamat Email
  - img
  - textbox "Alamat Email":
    - /placeholder: admin@pabalu.com
  - text: Kata Sandi
  - link "Lupa?":
    - /url: /forgot-password
  - textbox "Kata Sandi":
    - /placeholder: ••••••••
  - button "Show password":
    - img
  - checkbox "Ingat saya di perangkat ini"
  - text: Ingat saya di perangkat ini
  - button "Masuk":
    - text: Masuk
    - img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Sidebar & Header Integration', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate to dashboard
  6  |     await page.goto('http://localhost:8000/dashboard');
  7  |     await page.waitForLoadState('networkidle');
  8  |   });
  9  | 
  10 |   test('sidebar dan header menyatu tanpa outline', async ({ page }) => {
  11 |     // Check sidebar is visible
  12 |     const sidebar = page.locator('nav.fixed.left-0').first();
> 13 |     await expect(sidebar).toBeVisible();
     |                           ^ Error: expect(locator).toBeVisible() failed
  14 | 
  15 |     // Check header is visible
  16 |     const header = page.locator('header.fixed.top-0').first();
  17 |     await expect(header).toBeVisible();
  18 | 
  19 |     // Verify sidebar has no border (outline removed)
  20 |     const sidebarClasses = await sidebar.getAttribute('class');
  21 |     expect(sidebarClasses).not.toContain('border-r');
  22 | 
  23 |     // Take screenshot to verify visual appearance
  24 |     await page.screenshot({ path: 'test-sidebar-unified.png', fullPage: false });
  25 |   });
  26 | 
  27 |   test('sidebar collapse functionality works', async ({ page }) => {
  28 |     // Find collapse button (should be in header)
  29 |     const collapseButton = page.locator('header button').filter({ has: page.locator('svg') }).first();
  30 |     await expect(collapseButton).toBeVisible();
  31 | 
  32 |     // Get initial sidebar width
  33 |     const sidebar = page.locator('nav.fixed.left-0').first();
  34 |     const initialClasses = await sidebar.getAttribute('class');
  35 | 
  36 |     // Click collapse button
  37 |     await collapseButton.click();
  38 |     await page.waitForTimeout(300); // Wait for animation
  39 | 
  40 |     // Verify sidebar width changed
  41 |     const collapsedClasses = await sidebar.getAttribute('class');
  42 |     expect(collapsedClasses).not.toBe(initialClasses);
  43 | 
  44 |     // Take screenshot in collapsed state
  45 |     await page.screenshot({ path: 'test-sidebar-collapsed.png', fullPage: false });
  46 | 
  47 |     // Click again to expand
  48 |     await collapseButton.click();
  49 |     await page.waitForTimeout(300);
  50 | 
  51 |     // Verify it expanded back
  52 |     const expandedClasses = await sidebar.getAttribute('class');
  53 |     expect(expandedClasses).toBe(initialClasses);
  54 |   });
  55 | 
  56 |   test('sidebar navigation items are clickable', async ({ page }) => {
  57 |     // Get first nav item (Dashboard)
  58 |     const firstNavItem = page.locator('nav.fixed.left-0 a').first();
  59 |     await expect(firstNavItem).toBeVisible();
  60 | 
  61 |     // Hover to check tooltip behavior when collapsed
  62 |     await firstNavItem.hover();
  63 |     await page.waitForTimeout(200);
  64 | 
  65 |     // Click should navigate
  66 |     await firstNavItem.click();
  67 |     await page.waitForLoadState('networkidle');
  68 | 
  69 |     // Should still be on dashboard or navigated page
  70 |     expect(page.url()).toContain('localhost:8000');
  71 |   });
  72 | 
  73 |   test('responsive behavior on mobile', async ({ page }) => {
  74 |     // Set mobile viewport
  75 |     await page.setViewportSize({ width: 375, height: 667 });
  76 | 
  77 |     // Sidebar should be hidden on mobile (md:flex means hidden below md breakpoint)
  78 |     const sidebar = page.locator('nav.fixed.left-0').first();
  79 |     await expect(sidebar).toBeHidden();
  80 | 
  81 |     // Header should still be visible
  82 |     const header = page.locator('header.fixed.top-0').first();
  83 |     await expect(header).toBeVisible();
  84 | 
  85 |     await page.screenshot({ path: 'test-mobile-view.png', fullPage: false });
  86 |   });
  87 | });
  88 | 
```