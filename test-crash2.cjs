const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  // We need to persist local storage
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Start session
  const mandiriBtn = await page.$('text="Latihan Mandiri"');
  if (mandiriBtn) await mandiriBtn.click();
  
  const nameInput = await page.$('input[placeholder="Contoh: Ahmad"]');
  if (nameInput) await nameInput.fill('Tester Resume');
  
  const mulaiBtn = await page.$('text="Mulai Latihan Mandiri"');
  if (mulaiBtn) await mulaiBtn.click();
  
  await page.waitForTimeout(2000);
  
  // Fill Step 1
  const ide1 = await page.$('textarea[placeholder*="Gagasan 1"]');
  if (ide1) await ide1.fill('Testing 1');
  const ide2 = await page.$('textarea[placeholder*="Gagasan 2"]');
  if (ide2) await ide2.fill('Testing 2');
  await page.waitForTimeout(1000);
  
  // Click Lanjut
  const lanjutBtn = await page.$('button:has-text("Lanjut ke Pilih Kosakata")');
  if (lanjutBtn) await lanjutBtn.click();
  await page.waitForTimeout(2000);
  
  console.log("Completed step 1. Reloading page to test resume...");
  
  // Reload to go back to home screen
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Find the resume button (Lanjut)
  // It's in the Saved Solo Sessions list
  const resumeBtn = await page.$('button:has-text("Lanjut")');
  if (resumeBtn) {
    console.log("Clicking Lanjut on saved session");
    await resumeBtn.click();
  } else {
    console.log("No resume button found!");
  }
  
  await page.waitForTimeout(3000);
  console.log("Done resume test");
  
  await browser.close();
})();
