import puppeteer from 'puppeteer';

async function testVaultAsKrylo() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1100 });

  // Set localStorage mock as Krylo before loading
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('krims_discord_user', JSON.stringify({
      id: '1414143825538191373',
      username: 'Krylo',
      global_name: 'Krylo',
      avatar: null
    }));
    localStorage.setItem('krims_founder_grant', 'true');
    localStorage.setItem('krims_vault_balance', '1000000');
  });

  await page.goto('file:///C:/Users/naina/.gemini/antigravity/scratch/krims-bot-dashboard/rewards.html', {
    waitUntil: 'networkidle0'
  });

  await new Promise(r => setTimeout(r, 1000));

  const vaultStats = await page.evaluate(() => {
    return {
      name: document.getElementById('user-name-tag')?.textContent,
      id: document.getElementById('user-id-text')?.textContent,
      kr: document.getElementById('vault-kr-val')?.textContent,
      streak: document.getElementById('vault-streak-val')?.textContent,
      clearance: document.getElementById('vault-clearance-val')?.textContent,
      clearanceClass: document.getElementById('vault-clearance-val')?.className
    };
  });
  console.log('Vault Stats for Krylo:', vaultStats);

  // Take screenshot of vault
  const vaultElement = await page.$('.vault-card');
  if (vaultElement) {
    await vaultElement.screenshot({
      path: 'C:/Users/naina/.gemini/antigravity/brain/00b316cf-2843-40c3-9037-0d534a8d9fd7/verified_vault_founder.png'
    });
  }

  await browser.close();
  console.log('Screenshot saved to verified_vault_founder.png');
}

testVaultAsKrylo().catch(console.error);
