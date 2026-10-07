import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_EMAIL } from './e2e-helpers.js';

test.describe('Admin Sidebar & Header Integration', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_EMAIL);
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('sidebar dan header tampil menyatu', async ({ page }) => {
        const sidebar = page.locator('nav.fixed.left-0').first();
        await expect(sidebar).toBeVisible({ timeout: 20_000 });

        const header = page.locator('header.fixed.top-0').first();
        await expect(header).toBeVisible();

        await page.screenshot({ path: 'test-sidebar-unified.png', fullPage: false });
    });

    test('sidebar collapse functionality works', async ({ page }) => {
        const collapseButton = page.locator('header button').filter({ has: page.locator('svg') }).first();
        await expect(collapseButton).toBeVisible({ timeout: 20_000 });

        const sidebar = page.locator('nav.fixed.left-0').first();
        const initialClasses = await sidebar.getAttribute('class');

        await collapseButton.click();
        await page.waitForTimeout(300);

        const collapsedClasses = await sidebar.getAttribute('class');
        expect(collapsedClasses).not.toBe(initialClasses);

        await page.screenshot({ path: 'test-sidebar-collapsed.png', fullPage: false });

        await collapseButton.click();
        await page.waitForTimeout(300);

        const expandedClasses = await sidebar.getAttribute('class');
        expect(expandedClasses).toBe(initialClasses);
    });

    test('sidebar navigation items are clickable', async ({ page }) => {
        const firstNavItem = page.locator('nav.fixed.left-0 a').first();
        await expect(firstNavItem).toBeVisible({ timeout: 20_000 });

        await firstNavItem.hover();
        await page.waitForTimeout(200);

        const expectedPath = await firstNavItem.getAttribute('href');
        await firstNavItem.click();
        await page.waitForLoadState('networkidle');

        expect(new URL(page.url()).pathname).toBe(expectedPath);
    });

    test('responsive behavior on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const sidebar = page.locator('nav.fixed.left-0').first();
        await expect(sidebar).toBeHidden({ timeout: 20_000 });

        const header = page.locator('header.fixed.top-0').first();
        await expect(header).toBeVisible();

        await page.screenshot({ path: 'test-mobile-view.png', fullPage: false });
    });
});
