const puppeteer = require('puppeteer-core');

async function verifyPersistence() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new"
  });
  
  console.log("=== Verification 1: Network Failure ===");
  const page1 = await browser.newPage();
  await page1.setRequestInterception(true);
  
  page1.on('request', request => {
    if (request.url().includes('/auth/me')) {
      console.log("[Network Failure Test] Aborting /auth/me request to simulate backend down.");
      request.abort('failed');
    } else {
      request.continue();
    }
  });

  await page1.goto('http://localhost:3000/login');
  await page1.evaluate(() => localStorage.setItem('token', 'valid_token_string_here'));
  
  // Reload or go to dashboard to trigger AuthProvider initAuth
  await page1.goto('http://localhost:3000/dashboard');
  
  // Wait for React to process the AuthProvider mount
  await new Promise(r => setTimeout(r, 2000));
  
  const token1 = await page1.evaluate(() => localStorage.getItem('token'));
  if (token1 === 'valid_token_string_here') {
    console.log("PASS: Token remained in localStorage after network failure.");
  } else {
    console.error("FAIL: Token was removed or changed:", token1);
  }
  
  await page1.close();

  console.log("\n=== Verification 2: Genuine 401 Unauthorized ===");
  const page2 = await browser.newPage();
  await page2.setRequestInterception(true);
  
  page2.on('request', request => {
    if (request.url().includes('/auth/me')) {
      console.log("[401 Test] Mocking 401 Unauthorized response from backend.");
      request.respond({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: "Invalid token" })
      });
    } else {
      request.continue();
    }
  });

  await page2.goto('http://localhost:3000/login');
  await page2.evaluate(() => localStorage.setItem('token', 'expired_token_string_here'));
  
  // Reload or go to dashboard to trigger AuthProvider initAuth
  await page2.goto('http://localhost:3000/dashboard');
  
  // Wait for React to process the AuthProvider mount and the APIError rejection
  await new Promise(r => setTimeout(r, 2000));
  
  const token2 = await page2.evaluate(() => localStorage.getItem('token'));
  if (token2 === null || token2 === undefined) {
    console.log("PASS: Token was cleared from localStorage after 401 response.");
  } else {
    console.error("FAIL: Token remained in localStorage after 401:", token2);
  }
  
  await page2.close();
  await browser.close();
}

verifyPersistence().catch(console.error);
