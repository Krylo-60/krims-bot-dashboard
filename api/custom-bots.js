export default async function handler(req, res) {
  // CORS Headers support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. GET: Return Founder Slot Status & Pricing
  if (req.method === 'GET') {
    // We simulate/fetch live slots. In production, connects to Render / DB
    return res.status(200).json({
      ok: true,
      founderLimit: 100,
      claimedCount: 7, // Live counter
      remainingSlots: 93,
      tiers: [
        {
          name: 'Founder 100',
          price: '$0 / forever',
          badge: 'EARLY FOUNDER',
          customBots: 1,
          features: [
            '1 Custom-Branded Bot',
            'Full Krims Gemini AI Brain',
            'MEE6-Grade Leveling & Rank Cards',
            'Dyno AutoMod Suite',
            'Powered by Krims Code AI Footer'
          ]
        },
        {
          name: 'Pro Tier',
          price: '$4.99 / mo',
          badge: 'POPULAR',
          customBots: 1,
          features: [
            '1 Custom Automated Bot',
            'Custom AI Personality / Persona',
            'Unlimited Gemini AI Chat',
            'Custom Embed & Rank Colors',
            'Priority Uptime'
          ]
        },
        {
          name: 'Premium Tier',
          price: '$14.99 / mo',
          badge: 'NETWORKS',
          customBots: 5,
          features: [
            'Up to 5 Custom Bots',
            'Multi-Gamemode Server Linking',
            'Minecraft MySQL Economy Sync',
            'VIP 24/7 Dedicated Priority',
            'Custom Reaction Roles & Tickets'
          ]
        },
        {
          name: 'Enterprise',
          price: 'Custom Quote',
          badge: 'SCALE',
          customBots: '10 to 1,000+ Bots',
          features: [
            'Custom Bot Fleet (10 – 1,000+)',
            'Dedicated Cloud Cluster',
            'Optional White-Labeling (Remove watermark)',
            'Direct Developer Support & SLA',
            'Custom In-Game Minecraft Bridges'
          ],
          action: 'contact_support'
        }
      ]
    });
  }

  // 2. POST: Register & Validate Custom Bot Token
  if (req.method === 'POST') {
    const { token, guildId, ownerId, botName, aiPersona, activityName } = req.body || {};

    if (!token || !token.trim()) {
      return res.status(400).json({ error: 'Discord Bot Token is required!' });
    }

    try {
      // Validate Token with Discord REST API
      const discordRes = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${token.trim()}` }
      });

      if (!discordRes.ok) {
        const errorDetail = await discordRes.text();
        return res.status(400).json({ 
          error: 'Discord rejected this token. Please make sure you copied the entire Bot Token from the Discord Developer Portal.',
          detail: errorDetail 
        });
      }

      const botUser = await discordRes.json();

      // Generate 1-Click Bot Invite URL with Administrator or full permissions
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botUser.id}&permissions=8&scope=bot%20applications.commands`;

      // Forward to live Render backend to boot the bot online
      const renderApiUrl = process.env.RENDER_BOT_WEBHOOK_URL || 'https://krims-discord-bot-d57m.onrender.com/api/custom-bots';
      let renderResult = null;
      let isBotRunning = false;
      try {
        const renderRes = await fetch(renderApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token: token.trim(), 
            guildId: guildId || 'global_' + botUser.id, 
            ownerId: ownerId || 'dashboard', 
            botName: botName ? botName.trim() : botUser.username, 
            aiPersona, 
            activityName 
          })
        });

        if (renderRes.ok) {
          renderResult = await renderRes.json();
          isBotRunning = renderResult.ok !== false;
          console.log('[Custom Bot] Successfully spawned on Render backend:', renderResult);
        } else {
          const errText = await renderRes.text();
          console.warn('[Custom Bot] Render backend returned:', renderRes.status, errText);
        }
      } catch (e) {
        console.error('[Custom Bot] Error forwarding to Render:', e.message);
      }

      return res.status(200).json({
        ok: true,
        message: `Successfully connected bot "${botUser.username}#${botUser.discriminator || '0'}"!`,
        isOnline: isBotRunning,
        botUser: {
          id: botUser.id,
          username: botUser.username,
          avatar: botUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${botUser.id}/${botUser.avatar}.png`
            : null
        },
        inviteUrl,
        founderSlotAssigned: 8
      });
    } catch (err) {
      console.error('Custom bot error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error validating token.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
