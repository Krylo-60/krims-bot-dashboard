const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 850});
  
  const html = fs.readFileSync('C:/Users/naina/.gemini/antigravity/scratch/krims-bot-dashboard/devcustombot.html', 'utf-8');
  await page.setContent(html, {waitUntil: 'domcontentloaded'});
  
  await page.screenshot({path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/dev_pin_locked.png'});
  
  await page.evaluate(() => {
    document.getElementById('devPinInput').value = 'Krylo is the best';
    handlePinSubmit({ preventDefault: () => {} });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/dev_pin_unlocked.png', fullPage: true});
  
  await browser.close();
  console.log('Done!');
})();
