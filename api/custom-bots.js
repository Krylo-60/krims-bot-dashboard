import { verifyBotId } from './_botid.js';

const OFFICIAL_KRIMS_BOT_IDS = new Set([
  '1523794466740371586', // Krims Code AI
  '1572758718091890818', // Krims Code Pro
]);

const ANTI_CHALLENGE_PATTERNS = [
  /bypass\s+(botid|captcha|firewall|security|krims)/i,
  /(attack|ddos|raid|spam|scrape|flood|challenge)\s+.*(krims-code\.net|dash\.krims-code\.net|krims\s*code)/i,
];

function hasProhibitedChallengeContent(...fields) {
  return fields.some((value) =>
    typeof value === 'string' && ANTI_CHALLENGE_PATTERNS.some((re) => re.test(value))
  );
}

// Live Founder Slots Counter (Base: 91)
let liveClaimedSlots = 91;

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
      claimedCount: liveClaimedSlots, // Live counter
      remainingSlots: Math.max(0, 100 - liveClaimedSlots),
      tiers: [
        {
          name: 'Starter Founder',
          price: '$0 / Forever',
          badge: '100% FREE FOREVER',
          customBots: 1,
          description: '1 Free Custom Bot for every Discord community. Zero credit card required.',
          features: [
            '1 Custom-Branded Bot (100% Free Forever)',
            'Full Krims Proprietary Neural AI Brain',
            'MEE6-Grade Leveling & Custom Rank Cards',
            'Dyno AutoMod Suite & Private Tickets',
            '24/7 High-Speed Cloud Uptime',
            'Founder 100 Slot (91/100 Claimed)'
          ],
          action: 'claim_free'
        },
        {
          name: 'Pro Fleet',
          price: '$4.99 / mo',
          krPrice: '8,000 Kr',
          badge: 'POPULAR FLEET',
          customBots: 5,
          description: 'Up to 5 custom bots. Directly funds our krims-code.net domain renewal & dedicated cloud shards.',
          features: [
            'Up to 5 Custom Automated Bots',
            'Dedicated High-Speed Cloud Compute Shards',
            'Custom AI Personas & Deep Personality Studio',
            'Custom Status & Activity Rotations',
            'Funds krims-code.net Domain & Hosting',
            'Priority 24/7 High-Availability Cluster'
          ],
          action: 'upgrade_pro'
        },
        {
          name: 'Enterprise Cluster',
          price: '$14.99 / mo',
          krPrice: '25,000 Kr',
          badge: 'UNLIMITED & BRIDGES',
          customBots: 'Unlimited Bots',
          description: 'For gaming networks & multi-server communities needing full white-labeling and Minecraft bridges.',
          features: [
            'Unlimited Custom Bot Fleet',
            'Full White-Labeling (Zero Krims Watermarks)',
            'Minecraft KryloSMP Chat & Economy Bridge',
            'Dedicated Private Compute Instance',
            'VIP Direct Developer SLA & Support',
            'Custom In-Game Discord Roles & Economy'
          ],
          action: 'contact_support'
        }
      ]
    });
  }

  // 2. POST: Register & Validate Custom Bot Token
  if (req.method === 'POST') {
    if (!(await verifyBotId(req, res))) return;

    const { token, guildId, ownerId, botName, aiPersona, activityName } = req.body || {};

    if (!token || !token.trim()) {
      return res.status(400).json({ error: 'Discord Bot Token is required!' });
    }

    if (hasProhibitedChallengeContent(botName, aiPersona, activityName)) {
      return res.status(403).json({
        error: 'Custom bots cannot be configured to challenge, impersonate, or bypass Krims Code security.',
      });
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

      if (OFFICIAL_KRIMS_BOT_IDS.has(botUser.id)) {
        return res.status(403).json({
          error: 'Official Krims Code fleet bots cannot be registered or overwritten as custom bots.',
        });
      }

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
        founderSlotAssigned: liveClaimedSlots,
        remainingSlots: Math.max(0, 100 - (++liveClaimedSlots))
      });
    } catch (err) {
      console.error('Custom bot error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error validating token.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
