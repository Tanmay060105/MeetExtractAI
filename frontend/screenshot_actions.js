const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  // Go to login page
  console.log("Navigating to login...");
  await page.goto('http://localhost:3000/login');
  
  // Type credentials (assuming test/test or admin/admin from earlier steps, let's try the usual test user)
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'test@example.com');
  await page.type('input[type="password"]', 'password123');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForNavigation();
  
  // Go to actions page
  console.log("Navigating to actions...");
  await page.goto('http://localhost:3000/dashboard/actions');
  
  // Wait for network idle or 3 seconds
  await page.waitForTimeout(3000);
  
  // Take screenshot
  console.log("Taking screenshot...");
  await page.screenshot({ path: 'actions_page_verification.png' });
  
  await browser.close();
  console.log("Done!");
})();
