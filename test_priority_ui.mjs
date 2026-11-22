import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to dashboard...');
  await page.goto('https://krims-code.net', { waitUntil: 'networkidle2' });

  // Wait a moment for rendering
  await new Promise(r => setTimeout(r, 1500));

  // Take full dashboard screenshot with sidebar
  await page.screenshot({
    path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/dashboard_sidebar_priority.png'
  });
  console.log('Captured sidebar screenshot.');

  // Click the top nav priority button to open modal
  await page.evaluate(() => {
    if (window.openPriorityApiModal) window.openPriorityApiModal();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/dashboard_priority_modal.png'
  });
  console.log('Captured modal screenshot.');

  // Fill in sample key and activate priority
  await page.evaluate(async () => {
    const keyInput = document.getElementById('modal-priority-key');
    if (keyInput) keyInput.value = 'AIzaSyDemoSampleCommunityKey2026';
    if (window.saveAndActivatePriorityKeyFromModal) {
      await window.saveAndActivatePriorityKeyFromModal();
    }
  });

  await new Promise(r => setTimeout(r, 1600));

  // Switch to AI tab to view live telemetry
  await page.evaluate(() => {
    const aiBtn = document.querySelector('button[data-tab="tab-ai"]');
    if (aiBtn) aiBtn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  // Test running the fastpath query
  await page.evaluate(() => {
    if (window.runPriorityTestQuery) window.runPriorityTestQuery();
  });

  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/dashboard_ai_tab_priority_active.png'
  });
  console.log('Captured active AI tab telemetry screenshot.');

  await browser.close();
}

main().catch(console.error);
