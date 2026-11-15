import puppeteer from 'puppeteer';

async function testRewardsPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('file:///C:/Users/naina/.gemini/antigravity/scratch/krims-bot-dashboard/rewards.html', {
    waitUntil: 'networkidle0'
  });

  // Evaluate and check countdown text
  const cdInfo = await page.evaluate(() => {
    return {
      days: document.getElementById('cd-days')?.textContent,
      hours: document.getElementById('cd-hours')?.textContent,
      mins: document.getElementById('cd-mins')?.textContent,
      secs: document.getElementById('cd-secs')?.textContent,
      countdownBar: document.querySelector('.countdown-bar')?.innerText
    };
  });
  console.log('Countdown values:', cdInfo);

  // Take screenshot of hero & countdown
  await page.screenshot({
    path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/verified_rewards_fixed.png',
    clip: { x: 0, y: 0, width: 1280, height: 750 }
  });

  await browser.close();
  console.log('Screenshot saved to verified_rewards_fixed.png');
}

testRewardsPage().catch(console.error);
