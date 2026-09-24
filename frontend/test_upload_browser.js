const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function testBrowserUpload() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new"
  });
  
  const page = await browser.newPage();
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    if (request.url().includes('/meetings/upload') && request.method() === 'POST') {
      const headers = request.headers();
      console.log('--- UPLOAD REQUEST HEADERS ---');
      console.log('Content-Type:', headers['content-type']);
      
      if (headers['content-type'] === 'application/json') {
        console.error('ERROR: Content-Type is still application/json!');
      } else if (headers['content-type'] && headers['content-type'].includes('multipart/form-data')) {
        console.log('SUCCESS: Content-Type is multipart/form-data as expected!');
      } else {
        console.log('Content-Type is:', headers['content-type']);
      }
    }
    request.continue();
  });

  page.on('response', async response => {
    if (response.url().includes('/meetings/upload') && response.request().method() === 'POST') {
      console.log('--- UPLOAD RESPONSE ---');
      console.log('Status:', response.status());
      try {
        const body = await response.json();
        console.log('Body:', body);
      } catch (e) {
        console.log('Could not parse response body');
      }
    }
  });

  // 1. Get a token via API
  const email = `browser_${Date.now()}@example.com`;
  const password = "securepassword123";
  await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name: "Browser User", password })
  });
  const loginRes = await fetch('http://localhost:8000/api/v1/auth/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  });
  const { access_token } = await loginRes.json();

  // 2. Load page and set token
  await page.goto('http://localhost:3000/login');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, access_token);

  // 3. Go to upload page
  await page.goto('http://localhost:3000/dashboard/meetings/upload');
  
  // 4. Create dummy file
  fs.writeFileSync('browser_test.txt', 'This is a test from Puppeteer');
  
  // 5. Fill out form
  console.log("Setting up file upload...");
  // Type into the title input (it's the only input besides the hidden file input)
  await page.type('input[placeholder="e.g. Q3 Roadmap Planning"]', 'Puppeteer Test Meeting');
  
  // Upload file
  const elementHandle = await page.$('input[type=file]');
  await elementHandle.uploadFile('browser_test.txt');
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking Upload button...");
  // Click the Upload button (which is the last button inside the card footer)
  const buttons = await page.$$('button');
  await buttons[buttons.length - 1].click();

  // Wait for navigation or error
  console.log("Waiting for network activity...");
  await new Promise(r => setTimeout(r, 3000));

  await browser.close();
}

testBrowserUpload().catch(console.error);
