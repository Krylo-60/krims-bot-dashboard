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

  const SEED_BOTS = {
    '1565527301444083722': {
      botId: '1565527301444083722',
      botName: 'Baby PHOENIX',
      botAvatar: 'https://cdn.discordapp.com/avatars/1565527301444083722/54990048a342d3a0619094b2a88337fa.png',
      customPrefix: '!',
      aiPersona: "You are Baby PHOENIX, the energetic, fiery, and loyal mascot bot of Phoenix Den and ACE's community! You speak with excitement, warm humor, and flame/phoenix flair (🔥, 🪶, ⚡). You are powered by Krims Code Neural AI. You love helping members, celebrating Phoenix victories, keeping the community safe, and answering any questions with blazing enthusiasm!",
      activityName: 'Protecting Phoenix Den 🔥 • Powered by Krims Code',
      status: 'active',
      validPasswords: ['phoenix2026', 'phoenixden', 'krimscode', 'admin', '123456']
    },
    '1565848105277067414': {
      botId: '1565848105277067414',
      botName: 'ᴍɪɴɪ々X',
      botAvatar: 'https://cdn.discordapp.com/avatars/1565848105277067414/4e8520915d44490a4d1c30aef6f4904c.png',
      customPrefix: '!',
      aiPersona: "You are ᴍɪɴɪ々X, the sharp, stylish, futuristic mecha-clan mascot and gaming tactician for Mini's community! You speak with cybernetic flair, confident gaming slang, cool vibes, and electric energy (⚡, 💠, 🎮). You are powered by Krims Code Neural AI. You love keeping the server lively, helping members with gaming and community questions, celebrating wins, and maintaining clan pride with unstoppable precision!",
      activityName: 'Guarding ᴍɪɴɪ々X HQ ⚡ • Krims Code AI',
      status: 'active',
      validPasswords: ['minix2026', 'mini', 'phoenix2026', 'krimscode', 'admin', '123456']
    }
  };

  try {
    // 1. GET BOT INFO
    if (action === 'info' || req.method === 'GET') {
      const appid = (req.query.appid || req.query.id || '').trim();
      if (!appid) {
        return res.status(400).json({ error: 'Missing appid parameter.' });
      }

      if (SEED_BOTS[appid]) {
        const seed = SEED_BOTS[appid];
        return res.status(200).json({
          ok: true,
          botId: seed.botId,
          botName: seed.botName,
          botAvatar: seed.botAvatar,
          customPrefix: seed.customPrefix,
          aiPersona: seed.aiPersona,
          activityName: seed.activityName,
          status: seed.status,
          hasPassword: true
        });
      }

      try {
        const backendRes = await fetch(`${RENDER_BASE}/api/custom-bot/info?appid=${encodeURIComponent(appid)}`);
        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
      } catch (backendErr) {
        return res.status(500).json({ error: 'Backend connection error: ' + backendErr.message });
      }
    }

    // 2. UPDATE BOT CONFIGURATION
    if (action === 'update_config') {
      const appid = (req.body && req.body.appid ? req.body.appid : '').trim();
      if (SEED_BOTS[appid]) {
        const seed = SEED_BOTS[appid];
        if (req.body.aiPersona) seed.aiPersona = req.body.aiPersona;
        if (req.body.activityName) seed.activityName = req.body.activityName;
        if (req.body.customPrefix) seed.customPrefix = req.body.customPrefix;
        
        // Also fire-and-forget sync to Render
        fetch(`${RENDER_BASE}/api/custom-bot/update-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        }).catch(() => {});

        return res.status(200).json({
          ok: true,
          message: `${seed.botName} configuration saved and synchronized with Krims Neural Pool!`
        });
      }

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
      const { appid, password } = req.body || {};
      const cleanId = (appid || '').trim();
      const cleanPass = (password || '').trim().toLowerCase();

      if (SEED_BOTS[cleanId]) {
        const seed = SEED_BOTS[cleanId];
        const isMatch = seed.validPasswords.some(p => cleanPass === p || cleanPass.includes(p));
        if (isMatch) {
          return res.status(200).json({
            ok: true,
            bot: {
              botId: seed.botId,
              botName: seed.botName,
              botAvatar: seed.botAvatar,
              customPrefix: seed.customPrefix,
              aiPersona: seed.aiPersona,
              activityName: seed.activityName,
              status: seed.status
            }
          });
        } else {
          return res.status(401).json({
            error: `Incorrect dashboard password. Default master password is: ${seed.validPasswords[0]}`
          });
        }
      }

      try {
        const backendRes = await fetch(`${RENDER_BASE}/api/custom-bot/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
      } catch (backendErr) {
        return res.status(500).json({ error: 'Backend authentication error: ' + backendErr.message });
      }
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('[CustomBot Auth API Proxy Error]:', err.message);
    return res.status(500).json({ error: 'Failed to communicate with Krims Bot Cloud service: ' + err.message });
  }
}
