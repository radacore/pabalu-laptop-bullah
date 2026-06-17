import { test, expect } from '@playwright/test';

test.describe('Admin Sidebar & Header Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:8000/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('sidebar dan header menyatu tanpa outline', async ({ page }) => {
    // Check sidebar is visible
    const sidebar = page.locator('nav.fixed.left-0').first();
    await expect(sidebar).toBeVisible();

    // Check header is visible
    const header = page.locator('header.fixed.top-0').first();
    await expect(header).toBeVisible();

    // Verify sidebar has no border (outline removed)
    const sidebarClasses = await sidebar.getAttribute('class');
    expect(sidebarClasses).not.toContain('border-r');

    // Take screenshot to verify visual appearance
    await page.screenshot({ path: 'test-sidebar-unified.png', fullPage: false });
  });

  test('sidebar collapse functionality works', async ({ page }) => {
    // Find collapse button (should be in header)
    const collapseButton = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await expect(collapseButton).toBeVisible();

    // Get initial sidebar width
    const sidebar = page.locator('nav.fixed.left-0').first();
    const initialClasses = await sidebar.getAttribute('class');

    // Click collapse button
    await collapseButton.click();
    await page.waitForTimeout(300); // Wait for animation

    // Verify sidebar width changed
    const collapsedClasses = await sidebar.getAttribute('class');
    expect(collapsedClasses).not.toBe(initialClasses);

    // Take screenshot in collapsed state
    await page.screenshot({ path: 'test-sidebar-collapsed.png', fullPage: false });

    // Click again to expand
    await collapseButton.click();
    await page.waitForTimeout(300);

    // Verify it expanded back
    const expandedClasses = await sidebar.getAttribute('class');
    expect(expandedClasses).toBe(initialClasses);
  });

  test('sidebar navigation items are clickable', async ({ page }) => {
    // Get first nav item (Dashboard)
    const firstNavItem = page.locator('nav.fixed.left-0 a').first();
    await expect(firstNavItem).toBeVisible();

    // Hover to check tooltip behavior when collapsed
    await firstNavItem.hover();
    await page.waitForTimeout(200);

    // Click should navigate
    await firstNavItem.click();
    await page.waitForLoadState('networkidle');

    // Should still be on dashboard or navigated page
    expect(page.url()).toContain('localhost:8000');
  });

  test('responsive behavior on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar should be hidden on mobile (md:flex means hidden below md breakpoint)
    const sidebar = page.locator('nav.fixed.left-0').first();
    await expect(sidebar).toBeHidden();

    // Header should still be visible
    const header = page.locator('header.fixed.top-0').first();
    await expect(header).toBeVisible();

    await page.screenshot({ path: 'test-mobile-view.png', fullPage: false });
  });
});
