import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Go to login page
  await page.goto('http://127.0.0.1:8000/login');
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshot-login-page.png', fullPage: true });
  
  console.log('✅ Login page screenshot saved: screenshot-login-page.png');
  console.log('📍 URL:', page.url());
  
  await browser.close();
})();
