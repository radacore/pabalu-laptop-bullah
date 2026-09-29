import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_EMAIL } from './e2e-helpers.js';

test.describe('Gelombang 4 - Guard tampil sebagai toast error', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_EMAIL);
    });

    test('hapus servis selesai ditolak + toast audit muncul', async ({ page }) => {
        await page.goto('/services?search=SRV-E2E-DONE1');
        await expect(page.locator('table').getByText('SRV-E2E-DONE1')).toBeVisible();

        await page.locator('tr', { hasText: 'SRV-E2E-DONE1' }).getByRole('button', { name: 'Hapus' }).click();
        await page.locator('[data-slot="dialog-content"]').getByRole('button', { name: 'Hapus' }).click();

        const toast = page.locator('[role="alert"]');
        await expect(toast.getByText(/audit/i)).toBeVisible({ timeout: 10_000 });

        // Data tetap ada (tidak terhapus)
        await expect(page.locator('table').getByText('SRV-E2E-DONE1')).toBeVisible();
    });

    test('hapus customer berelasi ditolak + toast muncul', async ({ page }) => {
        await page.goto('/customers?search=E2E+Toast');
        await expect(page.locator('table').getByText('E2E Toast Customer')).toBeVisible();

        await page.locator('tr', { hasText: 'E2E Toast Customer' }).getByRole('button', { name: 'Hapus' }).click();
        await page.locator('[data-slot="dialog-content"]').getByRole('button', { name: 'Hapus' }).click();

        const toast = page.locator('[role="alert"]');
        await expect(toast.getByText(/masih memiliki data servis/i)).toBeVisible({ timeout: 10_000 });

        await expect(page.locator('table').getByText('E2E Toast Customer')).toBeVisible();
    });
});
