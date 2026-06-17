import { chromium } from 'playwright';

async function testServiceTracking() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Opening homepage...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded');

    console.log('📝 Finding tracking form...');

    // Check how many forms exist
    const formCount = await page.locator('form').count();
    console.log(`Found ${formCount} form(s) on page`);

    // Find the tracking input specifically
    const input = page.locator('input#service-code');
    const inputCount = await input.count();
    console.log(`Found ${inputCount} input#service-code element(s)`);

    if (inputCount > 0) {
      // Fill the input
      await input.fill('SRV-20260613-3836');
      const inputValue = await input.inputValue();
      console.log(`✅ Input filled with value: "${inputValue}"`);

      // Find the submit button in the same form
      const form = page.locator('form:has(input#service-code)');
      const submitBtn = form.locator('button[type="submit"]');
      console.log('🔍 Clicking submit button...');
      await submitBtn.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      if (currentUrl.includes('/services/track/SRV-20260613-3836')) {
        console.log('✅ SUCCESS: Navigated to tracking page');

        // Verify tracking details are displayed
        const hasTicketHeader = await page.locator('text=Tiket Servis').count() > 0;
        const hasServiceCode = await page.locator('text=SRV-20260613-3836').count() > 0;

        if (hasTicketHeader) {
          console.log('✅ Ticket header displayed');
        }
        if (hasServiceCode) {
          console.log('✅ Service code displayed');
        }

      } else {
        console.log('❌ FAILED: Did not navigate to expected URL');
        console.log(`   Expected: /services/track/SRV-20260613-3836`);
        console.log(`   Got: ${currentUrl}`);

        // Check console errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            console.log('❌ Browser console error:', msg.text());
          }
        });
      }

      // Take screenshot
      await page.screenshot({ path: 'test-tracking-result.png', fullPage: true });
      console.log('📸 Screenshot saved: test-tracking-result.png');

    } else {
      console.log('❌ FAILED: Could not find tracking input');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'test-tracking-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

testServiceTracking();
