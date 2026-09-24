const puppeteer = require('puppeteer-core');
const fs = require('fs');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTAwOTg2OTQsInN1YiI6ImZjM2QxMTAwLWM2OGUtNDRjZS1hZjhlLTM2ZDUyODA3NWUyOSJ9.oOT3aGo20pZNBEwJ65j8kmDEiS81xvqBax-1JXE1vts';
const OUT_DIR = 'C:\\Users\\tanma\\.gemini\\antigravity-ide\\brain\\5581b175-5a4a-40a0-bd13-ee528e37bec2';

async function takeScreenshot(page, url, filename) {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000)); // wait for animations
  await page.screenshot({ path: `${OUT_DIR}\\${filename}`, fullPage: true });
  console.log(`Saved ${filename}`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Login Page
  await takeScreenshot(page, 'http://localhost:3001/login', 'login_page.png');

  // Set token
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, TOKEN);

  // 2. Dashboard
  await takeScreenshot(page, 'http://localhost:3001/dashboard', 'dashboard.png');

  // 3. Meetings Page
  await takeScreenshot(page, 'http://localhost:3001/dashboard/meetings', 'meetings.png');

  // 4. Action Items
  await takeScreenshot(page, 'http://localhost:3001/dashboard/actions', 'actions.png');

  // 5. Review Queue
  await takeScreenshot(page, 'http://localhost:3001/dashboard/reviews', 'reviews.png');

  await browser.close();
  console.log("Done taking screenshots.");
})();
