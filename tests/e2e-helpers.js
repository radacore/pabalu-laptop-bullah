/**
 * Helper bersama untuk e2e gelombang 2-5.
 * Login via form (Fortify), tanpa bypass session — menguji jalur asli user.
 */

export async function loginAs(page, email, password = 'password') {
    // Mulai dari sesi bersih agar bisa ganti akun antar test
    // (session driver database — cookie guard hilang = guest).
    await page.context().clearCookies();
    await page.goto('/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
}

export const ADMIN_EMAIL = 'admin@pabalu.com';

/**
 * Tandai dokumen untuk membuktikan navigasi Inertia tanpa full reload.
 * Kembalikan true bila marker masih hidup setelah aksi.
 */
export async function markDocument(page) {
    await page.evaluate(() => {
        window.__e2eMarker = 'alive';
    });
}

export async function documentSurvived(page) {
    return page.evaluate(() => window.__e2eMarker === 'alive');
}
