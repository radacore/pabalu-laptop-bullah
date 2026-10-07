import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_EMAIL } from './e2e-helpers.js';

// Role staff/teknisi dinonaktifkan: satu-satunya peran adalah admin.
// Menu Staff disembunyikan dan akun teknisi tidak di-seed.
test.describe('Gelombang 3 - Admin tunggal (role staff nonaktif)', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_EMAIL);
    });

    test('menu Staff tidak tampil di sidebar admin', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        await expect(
            page
                .locator('nav.fixed.left-0')
                .getByRole('link', { name: 'Staff' }),
        ).toBeHidden({ timeout: 20_000 });
    });

    test('admin tidak bisa nonaktifkan akun sendiri', async ({ page }) => {
        await page.goto('/staff');
        // Cari dulu — tabel paginasi, akun lama bisa di halaman belakang.
        await page
            .getByPlaceholder('Cari nama atau email...')
            .fill(ADMIN_EMAIL);
        await page.getByRole('button', { name: 'Filter', exact: true }).click();
        await expect(page.locator('tr', { hasText: ADMIN_EMAIL })).toBeVisible({
            timeout: 15_000,
        });
        await page
            .locator('tr', { hasText: ADMIN_EMAIL })
            .getByRole('link', { name: 'Edit' })
            .click();
        await expect(page).toHaveURL(/\/staff\/\d+\/edit/);

        // Uncheck "Akun aktif"
        const checkbox = page.getByLabel(/Akun aktif/);
        await expect(checkbox).toBeChecked();
        await checkbox.uncheck();
        await page.getByRole('button', { name: 'Simpan' }).click();

        await expect(
            page.getByText('tidak bisa menonaktifkan akun sendiri').first(),
        ).toBeVisible();
        // Toast error global ikut muncul (jaring pengaman wave 4)
        await expect(
            page
                .locator('[role="alert"]')
                .getByText('tidak bisa menonaktifkan akun sendiri'),
        ).toBeVisible();
    });
});
