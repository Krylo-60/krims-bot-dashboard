export default async function handler(req, res) {
  // CORS Headers support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const isDblWebhook = req.query?.mode === 'dbl_webhook' || (req.url && (req.url.includes('mode=dbl_webhook') || req.url.startsWith('/api/dbl/webhook')));
  if (isDblWebhook) {
    const backendBase = process.env.RENDER_BOT_URL || (process.env.RENDER_BOT_WEBHOOK_URL ? process.env.RENDER_BOT_WEBHOOK_URL.replace('/api/custom-bots', '') : 'https://krims-discord-bot-d57m.onrender.com');
    try {
      const fwdHeaders = { 'Content-Type': 'application/json' };
      if (req.headers['authorization']) fwdHeaders['Authorization'] = req.headers['authorization'];
      const fwdRes = await fetch(`${backendBase}/api/dbl/webhook`, {
        method: req.method,
        headers: fwdHeaders,
        body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined
      });
      const data = await fwdRes.json().catch(() => ({ ok: fwdRes.ok }));
      return res.status(fwdRes.status).json(data);
    } catch (e) {
      return res.status(502).json({ error: 'Webhook relay unavailable' });
    }
  }

  const isStatus = req.query?.mode === 'status' || (req.url && (req.url.includes('mode=status') || req.url.startsWith('/api/status')));
  if (isStatus) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    const backendBase = process.env.RENDER_BOT_URL || (process.env.RENDER_BOT_WEBHOOK_URL ? process.env.RENDER_BOT_WEBHOOK_URL.replace('/api/custom-bots', '') : 'https://krims-discord-bot-d57m.onrender.com');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const liveRes = await fetch(`${backendBase}/api/status`, { signal: controller.signal });
      clearTimeout(timer);
      if (liveRes.ok) {
        const liveData = await liveRes.json();
        const rawList = Array.isArray(liveData?.customBots?.list) ? liveData.customBots.list : [];
        const proEntry = rawList.find(b => b.id === '1572758718091890818' || b.guildId === 'global_1572758718091890818');
        const userCustomCount = rawList.length > 0
          ? rawList.filter(b => b.id !== '1572758718091890818' && b.guildId !== 'global_1572758718091890818').length
          : (liveData?.customBots?.count || 0);
        const updatedFleet = {
          ...(liveData?.fleet || {}),
          pro: liveData?.fleet?.pro || { name: 'Krims Code Pro', isOnline: proEntry ? !!proEntry.isOnline : true }
        };
        return res.status(200).json({
          source: 'live-cloud-shard-sync',
          domain: 'https://krims-code.net',
          ...liveData,
          fleet: updatedFleet,
          customBots: { count: userCustomCount },
          endpoints: {
            portal: 'https://krims-code.net/',
            customBotSpawner: 'https://krims-code.net/custombot',
            devlog: 'https://krims-code.net/vlog',
            wiki: 'https://krims-code.net/wiki',
            rewards: 'https://krims-code.net/rewards',
            updates: 'https://krims-code.net/updates',
            status: 'https://krims-code.net/api/status',
            topggWebhook: 'https://krims-code.net/api/topgg/webhook'
          },
          infrastructure: {
            ...(liveData?.infrastructure || {}),
            cloudProvider: 'Krims Dedicated Cloud Shards'
          }
        });
      }
    } catch (e) {
      // Fallback to direct Discord API check if shard is restarting
    }

    const start = Date.now();
    const token = process.env.DISCORD_TOKEN;
    let botOnline = false;
    let botTag = 'Krims Code AI';
    let activeGuilds = null;
    let apiLatencyMs = null;

    if (token) {
      try {
        const [meRes, guildsRes] = await Promise.all([
          fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bot ${token}` } }),
          fetch('https://discord.com/api/v10/users/@me/guilds', { headers: { Authorization: `Bot ${token}` } })
        ]);
        apiLatencyMs = Date.now() - start;
        if (meRes.ok) {
          const me = await meRes.json();
          botOnline = true;
          botTag = me.username ? `${me.username}#${me.discriminator || '0'}` : botTag;
        }
        if (guildsRes.ok) {
          const guilds = await guildsRes.json();
          if (Array.isArray(guilds)) activeGuilds = guilds.length;
        }
      } catch (e) {
        apiLatencyMs = Date.now() - start;
      }
    }

    return res.status(200).json({
      source: 'discord-gateway-fallback',
      systemStatus: botOnline ? 'OPERATIONAL' : 'DEGRADED',
      domain: 'https://krims-code.net',
      masterBot: { tag: botTag, isOnline: botOnline, guildCount: activeGuilds, ping: apiLatencyMs },
      timestamp: new Date().toISOString()
    });
  }

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    // Return empty list if token is not configured yet
    res.status(200).json([]);
    return;
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bot ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Discord API returned status ${response.status}`);
    }

    const guilds = await response.json();
    const activeGuildIds = guilds.map(g => g.id);
    res.status(200).json(activeGuildIds);
  } catch (err) {
    console.error("Error fetching bot guilds:", err);
    res.status(500).json({ error: err.message });
  }
}
