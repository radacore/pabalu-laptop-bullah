import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log('🌐 Navigating to http://localhost:8000/dashboard...');
    await page.goto('http://localhost:8000/dashboard');
    await page.waitForLoadState('networkidle');

    // Take screenshot first to see what's on the page
    await page.screenshot({
      path: 'sidebar-debug-1.png',
      fullPage: false
    });
    console.log('📸 Screenshot saved as sidebar-debug-1.png');

    // Check if we're on login page
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('⚠️  Redirected to login page. Attempting to login...');

      // Try to login
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      console.log(`📍 After login URL: ${page.url()}`);

      // Take screenshot after login
      await page.screenshot({
        path: 'sidebar-debug-2.png',
        fullPage: false
      });
      console.log('📸 Screenshot saved as sidebar-debug-2.png');
    }

    // Now check for sidebar
    await page.waitForTimeout(1000);

    // Try different selectors
    const sidebarSelectors = [
      'nav.fixed',
      'nav',
      '[class*="fixed"][class*="top"]',
      'aside'
    ];

    for (const selector of sidebarSelectors) {
      const count = await page.locator(selector).count();
      console.log(`🔍 Selector "${selector}": found ${count} element(s)`);

      if (count > 0) {
        const box = await page.locator(selector).first().boundingBox();
        if (box) {
          console.log(`   Position: top=${box.y}, left=${box.x}, width=${box.width}, height=${box.height}`);
        }
      }
    }

    // Final screenshot
    await page.screenshot({
      path: 'sidebar-debug-final.png',
      fullPage: true
    });
    console.log('📸 Final screenshot saved as sidebar-debug-final.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
