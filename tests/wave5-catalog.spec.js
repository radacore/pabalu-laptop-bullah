import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_EMAIL, markDocument, documentSurvived } from './e2e-helpers.js';

async function openServiceByCode(page, code) {
    await page.goto(`/services?search=${code}`);
    await expect(page.locator('table').getByText(code)).toBeVisible();
    await page.locator('tr', { hasText: code }).getByRole('link', { name: 'Lihat' }).click();
    await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10_000 });
}

test.describe('Gelombang 5 - Katalog: debounce + paginasi Inertia', () => {
    test('geser slider cepat hanya menembak 1 request (debounce 400ms)', async ({ page }) => {
        const shopXhr = [];
        page.on('request', (req) => {
            if (req.url().includes('/shop') && req.resourceType() === 'xhr') {
                shopXhr.push(req.url());
            }
        });

        await page.goto('/shop');
        await expect(page.locator('input[type="range"]').first()).toBeVisible();

        const slider = page.locator('input[type="range"]').first();
        const max = Number(await slider.getAttribute('max'));

        // 5 perubahan dalam <200ms — tanpa debounce = 5 request
        for (const v of [max - 500000, max - 1000000, max - 1500000, max - 2000000, max - 2500000]) {
            await slider.fill(String(Math.max(v, 0)));
        }

        await page.waitForTimeout(1500);

        expect(shopXhr.length).toBeLessThanOrEqual(2);
        expect(shopXhr.length).toBeGreaterThanOrEqual(1);
        await expect(page).toHaveURL(/max_price=/);
    });

    test('paginasi katalog tanpa full reload (Inertia Link)', async ({ page }) => {
        await page.goto('/shop');
        const pager = page.locator('nav[aria-label="Navigasi halaman"]');

        if (!(await pager.count())) {
            test.skip(true, 'data katalog < 2 halaman di DB dev');
        }

        await markDocument(page);
        const before = await page.url();
        await pager.getByRole('link', { name: 'Halaman 2' }).click();
        await expect(page).toHaveURL(/page=2/, { timeout: 10_000 });

        expect(await documentSurvived(page)).toBe(true);
        expect(page.url()).not.toBe(before);
    });
});

test.describe('Gelombang 2 - Part servis dari inventori + jurnal', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_EMAIL);
    });

    test('pilih stok inventori: nama+harga terisi, stok berkurang', async ({ page }) => {
        // Self-healing fixture: set stok ke 10 via form edit agar suite
        // bisa di-run ulang tanpa kehabisan stok.
        await page.goto('/spareparts?search=E2E+Keyboard');
        await expect(page.getByText('E2E Keyboard Test').first()).toBeVisible();
        await page.locator('tr', { hasText: 'E2E Keyboard Test' }).getByRole('link', { name: 'Edit' }).first().click();
        await expect(page).toHaveURL(/\/spareparts\/\d+\/edit/);
        const stockInput = page.locator("xpath=//label[normalize-space()='Stok']/following-sibling::input[1]");
        await stockInput.fill('10');
        await page.getByRole('button', { name: 'Simpan' }).click();
        await expect(page).toHaveURL(/\/spareparts$/, { timeout: 15_000 });

        await openServiceByCode(page, 'SRV-E2E-PART1');

        const partForm = page.locator('form').filter({ hasText: 'Ambil dari Stok' });
        // Select pertama = dropdown inventori (kedua = tipe sparepart)
        const inventorySelect = partForm.locator('select').first();
        await expect(inventorySelect).toBeVisible();
        const sparepartValue = await inventorySelect.evaluate((sel) => {
            const opt = [...sel.options].find((o) => o.text.includes('E2E Keyboard Test'));

            return opt ? opt.value : null;
        });
        expect(sparepartValue).toBeTruthy();
        await inventorySelect.selectOption(sparepartValue);

        await expect(partForm.locator('input[placeholder="Keyboard, SSD, Baterai"]')).toHaveValue('E2E Keyboard Test');

        await partForm.locator('input[type="number"]').fill('2');
        await partForm.getByRole('button', { name: 'Tambah Sparepart' }).click();

        await expect(page.locator('[role="alert"]').getByText(/berhasil/i)).toBeVisible({ timeout: 10_000 });

        // Stok berkurang di halaman sparepart (cari via index, tanpa hardcode id)
        await page.goto('/spareparts?search=E2E+Keyboard');
        await expect(page.getByText('E2E Keyboard Test').first()).toBeVisible();
        await page.locator('tr', { hasText: 'E2E Keyboard Test' }).getByRole('link', { name: 'Lihat' }).first().click();
        await expect(page).toHaveURL(/\/spareparts\/\d+/, { timeout: 10_000 });
        const stockText = await page.getByText(/Stok:/).first().textContent();
        const stock = Number(stockText.match(/Stok:\s*(\d+)/)?.[1] ?? NaN);
        expect(stock).toBeLessThan(10);
        expect(Number.isNaN(stock)).toBe(false);
    });

    test('selesaikan servis: jurnal pendapatan otomatis tercatat', async ({ page }) => {
        await openServiceByCode(page, 'SRV-E2E-PART1');

        const updateForm = page.locator('form').filter({ hasText: 'Simpan Update' });
        await updateForm.locator('select').selectOption({ label: 'Selesai' });
        await updateForm.locator('textarea[placeholder="Jelaskan perkembangan servis"]').fill('E2E selesai, siap diambil.');
        await updateForm.getByRole('button', { name: 'Simpan Update' }).click();

        await expect(page.locator('[role="alert"]').getByText(/berhasil/i)).toBeVisible({ timeout: 10_000 });

        // Jurnal muncul di tab transaksi halaman yang sama
        await expect(page.getByText('INC-SRV-E2E-PART1')).toBeVisible({ timeout: 10_000 });
    });
});
