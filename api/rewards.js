import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. POST: Mint and Issue Cryptographic License Key for Unlocked Passes
  if (req.method === 'POST') {
    try {
      const { action, passId, passName, cost, userId, userName, currentBalance, sendDm } = req.body || {};
      
      const passCatalog = {
        pass_7d: { tier: 'sprint', codePrefix: 'SPRI', days: 7, cost: 2500, name: '7-Day Premium Sprint' },
        pass_30d: { tier: 'pro', codePrefix: 'PRO', days: 30, cost: 8000, name: '30-Day Pro Season Pass' },
        pass_lifetime: { tier: 'enterprise', codePrefix: 'LIFE', days: null, cost: 25000, name: 'Enterprise Lifetime Access' }
      };

      const selected = passCatalog[passId] || Object.values(passCatalog).find(p => p.name.toLowerCase() === (passName || '').toLowerCase()) || passCatalog.pass_lifetime;

      const userCost = cost !== undefined ? Number(cost) : selected.cost;
      const isFounder = userId && (
        userId === '1414143825538191373' ||
        userId.toLowerCase().includes('krylo') ||
        userId.toLowerCase().includes('founder') ||
        userId.toLowerCase().includes('admin') ||
        userId === '1000000' ||
        userId === '1m'
      );

      // Check balance
      const balance = Number(currentBalance) || 0;
      if (!isFounder && balance < userCost) {
        return res.status(400).json({
          ok: false,
          error: `Insufficient KR balance. You need ${userCost.toLocaleString()} KR, but your vault has ${balance.toLocaleString()} KR.`
        });
      }

      // Mint authentic cryptographic license key: KRIMS-<PREFIX>-<6HEX>-<6HEX>
      const seg2 = crypto.randomBytes(3).toString('hex').toUpperCase();
      const seg3 = crypto.randomBytes(3).toString('hex').toUpperCase();
      const licenseKey = `KRIMS-${selected.codePrefix}-${seg2}-${seg3}`;

      // Notify live Render Bot backend to sync key to Neon Cloud Postgres & dispatch DM
      const renderApiUrl = process.env.RENDER_BOT_WEBHOOK_URL 
        ? process.env.RENDER_BOT_WEBHOOK_URL.replace('/api/custom-bots', '/api/generate-key')
        : 'https://krims-discord-bot-d57m.onrender.com/api/generate-key';

      let cloudSynced = false;
      let dmSent = false;
      try {
        const renderRes = await fetch(renderApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: selected.tier,
            days: selected.days,
            userId: userId || 'web_user',
            userName: userName || 'Authenticated Member',
            sendDm: sendDm !== false
          })
        });
        if (renderRes.ok) {
          const rData = await renderRes.json();
          cloudSynced = true;
          dmSent = !!rData.dmSent;
        }
      } catch (fwdErr) {
        console.warn('[Rewards API] Cloud Render forward warning:', fwdErr.message);
      }

      const newBalance = isFounder ? balance : Math.max(0, balance - userCost);

      return res.status(200).json({
        ok: true,
        licenseKey,
        passId: selected.tier,
        passName: selected.name,
        days: selected.days,
        cost: userCost,
        newBalance,
        cloudSynced,
        dmSent,
        instructions: `Run /premium activate key:${licenseKey} in your Discord server!`,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('[Rewards API] Mint key error:', err);
      return res.status(500).json({ ok: false, error: err.message || 'Internal server error minting license key.' });
    }
  }

  const userId = req.query.userId || req.query.id;

  // Real-time lookup or default vault calculation
  const isFounder = userId && (
    userId.toLowerCase().includes('krylo') ||
    userId.toLowerCase().includes('founder') ||
    userId.toLowerCase().includes('admin') ||
    userId === '1000000' ||
    userId === '1m'
  );

  const defaultBalance = 1000;
  const userVault = userId ? {
    userId,
    krimsRewards: isFounder ? 1000000 : (1000 + (Math.abs(hashString(userId)) % 15000)),
    dailyStreak: isFounder ? 99 : (1 + (Math.abs(hashString(userId)) % 14)),
    status: isFounder ? '👑 Krims Founder & Developer Clearance' : 'Verified Discord User'
  } : null;

  return res.status(200).json({
    ok: true,
    protocol: 'Krims Rewards Protocol v1.0',
    evolution: {
      legacyCurrency: 'KryloCoins (KC)',
      newCurrency: 'Krims Rewards (KR)',
      conversionRatio: '1:1',
      launchDate: '2026-11-09T00:00:00Z',
      status: 'Official Global Production GA',
      revealSchedule: 'Live Worldwide'
    },
    exclusiveUtility: {
      headline: 'The Only Key to Krims Code Premium',
      description: 'Spending Krims Rewards is the ONLY way to access Krims Code Premium passes, unlock priority neural reasoning, and deploy customized bot instances.'
    },
    passes: [
      {
        id: 'pass_7d',
        name: '7-Day Premium Sprint',
        cost: 2500,
        badge: 'Popular',
        features: [
          'Instant Priority Neural Reasoning (0ms queue)',
          '1 Dedicated Custom Bot Slot with AI Persona',
          '2x Voice XP & Leveling Multiplier',
          'Exclusive Krims Code Premium Discord Badge'
        ]
      },
      {
        id: 'pass_30d',
        name: '30-Day Pro Season Pass',
        cost: 8000,
        badge: 'Best Value',
        features: [
          'All 7-Day Pass Features included',
          'Unlimited Neural Context Memory across servers',
          'Up to 3 Custom Automated Bot Slots',
          'Advanced Dyno/MEE6 Migration Auto-Sync',
          'VIP Voice Lounge Access & Golden Nameplate'
        ]
      },
      {
        id: 'pass_lifetime',
        name: 'Enterprise Lifetime Access',
        cost: 25000,
        badge: 'Elite Tier',
        features: [
          'Permanent Lifetime Krims Code Premium',
          'Unlimited Custom Bot Fleet slots',
          'Direct Access to #👑・executive-lounge',
          'Exclusive Executive VIP Role & Golden Server Badges',
          'Founder-grade Support Priority'
        ]
      }
    ],
    earningMethods: [
      {
        icon: '🎙️',
        title: 'Voice Lounges',
        rate: '+15 KR / 10 mins',
        description: 'Earn rewards automatically while talking, streaming, or hanging out in voice channels.'
      },
      {
        icon: '💬',
        title: 'Chat & Daily Streaks',
        rate: '+100 - 500 KR / day',
        description: 'Chat in community servers and maintain daily streaks to multiply daily rewards.'
      },
      {
        icon: '🗳️',
        title: 'Top.gg & Bot Voting',
        rate: '+500 KR / vote',
        description: 'Support Krims Code by voting every 12 hours on bot listing platforms.'
      },
      {
        icon: '🎉',
        title: 'Events & Community Tournaments',
        rate: '+2,000 - 10,000 KR',
        description: 'Compete in weekly Discord server trivia, counting milestones, and community showdowns to claim massive Krims Rewards (KR) prize pools.'
      },
      {
        icon: '🔬',
        title: 'Developer & Security Bounties',
        rate: '+500 - 5,000 KR',
        description: 'Test new ecosystem features, submit community feedback in the Support Server, and report verified security issues to claim rewards bounties.'
      }
    ],
    roadmapUpdates: [
      {
        date: 'November 2026 • v6.1 GA',
        tag: 'Live Now',
        title: 'v6.1 Multi-Bot Ecosystem & Pass Redemption Live',
        summary: 'Official transition from legacy tokens to Krims Rewards across the entire bot fleet. Instant 1:1 balance conversion, cryptographic premium pass minting, and dynamic Join-to-Create voice hubs.'
      },
      {
        date: 'Mid November 2026',
        tag: 'Chat Economy',
        title: '🌧️ /kr-rain Community Chat Drops & Tipping',
        summary: 'Automated rain events and member-funded reward showers in Discord channels. Active members can initiate rain drops with custom KR amounts, splitting balances instantly among active chatters.'
      },
      {
        date: 'Mid November 2026',
        tag: 'Custom Bots',
        title: '🤖 White-Label Custom Bot Forge & Fleet Slots',
        summary: 'Deploy and host branded Discord bots powered by Krims Neural AI directly from the web dashboard. Includes custom avatar branding, custom command prefixes, and 24/7 dedicated cloud hosting.'
      },
      {
        date: 'Late November 2026',
        tag: 'Customization',
        title: '🎨 Custom Discord Color Roles & Vanity Badges',
        summary: 'Redeem 1,000 KR to unlock custom hex-color roles and prestigious server badges. Synchronizes dynamically across all Krims Code bot-enabled Discord servers with instant role assignment.'
      },
      {
        date: 'Late November 2026',
        tag: 'Marketplace',
        title: 'Creator & Bot Persona Marketplace',
        summary: 'Sell and trade custom bot system prompts, welcome embeds, and automated rule templates for KR.'
      },
      {
        date: 'December 2026',
        tag: 'Global Season 1',
        title: 'Season 1 Leaderboard & Elite Pass Hall of Fame',
        summary: 'Top Krims Rewards holders on the global leaderboard unlock Enterprise Lifetime passes, prestigious Champion roles, permanent custom server badges, and massive KR jackpot multipliers.'
      },
      {
        date: 'Early 2027',
        tag: 'Staking Vault',
        title: '🏦 Krims Staking Vault & Passive Yield Protocol',
        summary: 'Lock surplus Krims Rewards into time-tiered smart vaults to earn compounding passive yields, seasonal jackpot lottery entries, and exclusive early access to upcoming bot fleet neural models.'
      }
    ],
    userVault
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
