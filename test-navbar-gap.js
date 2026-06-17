import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Login
  await page.goto('http://127.0.0.1:8000/login');
  await page.fill('input[type="email"]', 'admin@pabalu.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // Wait for layout to settle
  await page.waitForTimeout(1000);
  
  // Inspect computed styles
  const styles = await page.evaluate(() => {
    const main = document.querySelector('main');
    const innerDiv = main?.querySelector(':scope > div');
    
    const mainStyles = main ? window.getComputedStyle(main) : null;
    const innerStyles = innerDiv ? window.getComputedStyle(innerDiv) : null;
    
    return {
      main: mainStyles ? {
        paddingTop: mainStyles.paddingTop,
        marginTop: mainStyles.marginTop,
        position: mainStyles.position,
        display: mainStyles.display,
        classes: main.className
      } : null,
      inner: innerStyles ? {
        padding: innerStyles.padding,
        paddingTop: innerStyles.paddingTop,
        marginTop: innerStyles.marginTop,
        classes: innerDiv.className
      } : null,
      header: (() => {
        const header = document.querySelector('header');
        if (!header) return null;
        const styles = window.getComputedStyle(header);
        return {
          height: styles.height,
          position: styles.position,
          top: styles.top
        };
      })()
    };
  });
  
  console.log('=== Computed Styles Analysis ===');
  console.log('Header:', JSON.stringify(styles.header, null, 2));
  console.log('Main:', JSON.stringify(styles.main, null, 2));
  console.log('Inner div:', JSON.stringify(styles.inner, null, 2));
  
  // Take screenshots
  await page.screenshot({ path: 'screenshot-navbar-gap.png', fullPage: false });
  await page.screenshot({ path: 'screenshot-navbar-gap-full.png', fullPage: true });
  
  console.log('\nScreenshots saved: screenshot-navbar-gap.png, screenshot-navbar-gap-full.png');
  
  await browser.close();
})();
