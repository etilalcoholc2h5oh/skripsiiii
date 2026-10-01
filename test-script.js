import puppeteer from 'puppeteer';
async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('ERROR:', err));
  await page.goto(`file://${process.cwd()}/test-imports.html`);
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
}
run();
