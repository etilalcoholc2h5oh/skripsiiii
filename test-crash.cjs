const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  
  // Wait for the app to load
  await page.waitForTimeout(2000);
  
  // Click "Latihan Mandiri"
  const mandiriBtn = await page.$('text="Latihan Mandiri"');
  if (mandiriBtn) await mandiriBtn.click();
  
  await page.waitForTimeout(1000);
  
  // Fill name
  const nameInput = await page.$('input[placeholder="Contoh: Ahmad"]');
  if (nameInput) await nameInput.fill('Tester');
  
  // Click Mulai
  const mulaiBtn = await page.$('text="Mulai Latihan Mandiri"');
  if (mulaiBtn) await mulaiBtn.click();
  
  await page.waitForTimeout(2000);
  
  // Check if we are in step 1
  const ide1 = await page.$('textarea[placeholder*="Gagasan 1"]');
  if (ide1) await ide1.fill('Testing 1');
  
  const ide2 = await page.$('textarea[placeholder*="Gagasan 2"]');
  if (ide2) await ide2.fill('Testing 2');
  
  await page.waitForTimeout(1000);
  
  // Click Lanjut
  const lanjutBtn = await page.$('button:has-text("Lanjut ke Pilih Kosakata")');
  if (lanjutBtn) await lanjutBtn.click();
  
  await page.waitForTimeout(2000);
  
  console.log("Done test");
  
  await browser.close();
})();
