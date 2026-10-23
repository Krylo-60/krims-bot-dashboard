export default async function handler(req, res) {
  // CORS Headers support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const RENDER_BASE = process.env.RENDER_BOT_WEBHOOK_URL 
    ? process.env.RENDER_BOT_WEBHOOK_URL.replace('/api/custom-bots', '') 
    : 'https://krims-discord-bot-d57m.onrender.com';

  const action = req.query.action || (req.body && req.body.action) || 'info';

  try {
    // 1. GET BOT INFO
    if (action === 'info' || req.method === 'GET') {
      const appid = req.query.appid || req.query.id;
      if (!appid) {
        return res.status(400).json({ error: 'Missing appid parameter.' });
      }

      const backendRes = await fetch(`${RENDER_BASE}/api/custom-bot/info?appid=${encodeURIComponent(appid)}`);
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    }

    // 2. UPDATE BOT CONFIGURATION
    if (action === 'update_config') {
      const backendRes = await fetch(`${RENDER_BASE}/api/custom-bot/update-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    }

    // 3. AUTH / PASSWORD SETUP / SIGN IN
    if (action === 'login' || action === 'setup_password' || req.method === 'POST') {
      const backendRes = await fetch(`${RENDER_BASE}/api/custom-bot/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('[CustomBot Auth API Proxy Error]:', err.message);
    return res.status(500).json({ error: 'Failed to communicate with Krims Bot Cloud service: ' + err.message });
  }
}
