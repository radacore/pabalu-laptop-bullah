import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_EMAIL, STAFF_EMAIL } from './e2e-helpers.js';

test.describe('Gelombang 3 - Staff management (admin-only)', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_EMAIL);
    });

    test('admin buat akun staff baru dan muncul di tabel', async ({ page }) => {
        const email = `e2e-staff-${Date.now()}@pabalu.com`;

        await page.goto('/staff');
        await expect(page.getByRole('heading', { name: 'Staff' })).toBeVisible();

        await page.getByRole('link', { name: 'Tambah Akun' }).click();
        await expect(page).toHaveURL(/\/staff\/create/);

        const form = page.locator('form', { has: page.getByRole('button', { name: 'Buat Akun' }) });
        await form.locator('input:not([type="email"]):not([type="password"])').first().fill('E2E Teknisi');
        await form.locator('input[type="email"]').fill(email);
        await form.locator('select').selectOption('staff');
        await form.locator('input[type="password"]').fill('password123');
        await page.getByRole('button', { name: 'Buat Akun' }).click();

        await expect(page).toHaveURL(/\/staff$/, { timeout: 15_000 });
        const row = page.locator('table tr', { hasText: email });
        await expect(row.getByText(email)).toBeVisible();
        await expect(row.getByText('Teknisi', { exact: true })).toBeVisible();
    });

    test('admin tidak bisa nonaktifkan akun sendiri', async ({ page }) => {
        await page.goto('/staff');
        // Cari dulu — tabel paginasi, akun lama bisa di halaman belakang.
        await page.getByPlaceholder('Cari nama atau email...').fill(ADMIN_EMAIL);
        await page.getByRole('button', { name: 'Filter', exact: true }).click();
        await expect(page.locator('tr', { hasText: ADMIN_EMAIL })).toBeVisible({ timeout: 15_000 });
        await page.locator('tr', { hasText: ADMIN_EMAIL }).getByRole('link', { name: 'Edit' }).click();
        await expect(page).toHaveURL(/\/staff\/\d+\/edit/);

        // Uncheck "Akun aktif"
        const checkbox = page.getByLabel(/Akun aktif/);
        await expect(checkbox).toBeChecked();
        await checkbox.uncheck();
        await page.getByRole('button', { name: 'Simpan' }).click();

        await expect(page.getByText('tidak bisa menonaktifkan akun sendiri').first()).toBeVisible();
        // Toast error global ikut muncul (jaring pengaman wave 4)
        await expect(page.locator('[role="alert"]').getByText('tidak bisa menonaktifkan akun sendiri')).toBeVisible();
    });

    test('staff tidak bisa buka halaman staff (403) dan tidak lihat menu', async ({ page }) => {
        await loginAs(page, STAFF_EMAIL);
        await page.goto('/staff');
        await expect(page.locator('text=403')).toBeVisible({ timeout: 10_000 });

        await page.goto('/dashboard');
        await expect(page.locator('nav.fixed.left-0').getByText('Staff')).toBeHidden();
    });

    test('admin lihat menu Staff di sidebar', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('nav.fixed.left-0').getByRole('link', { name: 'Staff' })).toBeVisible({ timeout: 20_000 });
    });
});
