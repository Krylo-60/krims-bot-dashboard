import puppeteer from 'puppeteer';

async function checkEarningAndRoadmap() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 2200 });

  await page.goto('file:///C:/Users/naina/.gemini/antigravity/scratch/krims-bot-dashboard/rewards.html', { waitUntil: 'networkidle0' });

  // Take screenshot of How to Earn and Continuous Pipeline
  await page.screenshot({
    path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/check_pipeline_section.png',
    clip: { x: 0, y: 1400, width: 1280, height: 1400 }
  });

  const fontInfo = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('.section-title, .section-eyebrow, .earning-title, .roadmap-content h3'));
    return titles.map(el => ({
      text: el.innerText,
      fontFamily: window.getComputedStyle(el).fontFamily,
      fontSize: window.getComputedStyle(el).fontSize,
      color: window.getComputedStyle(el).color
    }));
  });
  console.log('Fonts:', fontInfo);

  await browser.close();
}

checkEarningAndRoadmap().catch(console.error);
