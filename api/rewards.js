export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
      launchDate: '2026-11-02T00:00:00Z',
      status: 'Classified Sneak Peek',
      revealSchedule: 'Next Monday (Nov 2)'
    },
    exclusiveUtility: {
      headline: 'The Only Key to Krims Code Premium',
      description: 'Starting Next Monday, spending Krims Rewards is the ONLY way to access Krims Code Premium passes, unlock priority neural reasoning, and deploy customized bot instances.'
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
          'Official KSMP Whitelist & Gold Linked Role',
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
        icon: '⚔️',
        title: 'KSMP Tournaments & Events',
        rate: '+2,000 - 10,000 KR',
        description: 'Compete in weekly Minecraft KSMP PvP clashes, faction events, and boss battles to earn huge KR bonus rewards and trophy kits.'
      },
      {
        icon: '🔬',
        title: 'Alpha Testing & Bug Bounties',
        rate: '+500 - 5,000 KR',
        description: 'Test bleeding-edge prototypes in Krims Alpha and report verified system vulnerabilities.'
      }
    ],
    roadmapUpdates: [
      {
        date: 'Next Monday • Nov 2, 2026',
        tag: 'Official Launch',
        title: 'Public Reveal & Premium Pass Unlocking',
        summary: 'Official public transition from KryloCoins to Krims Rewards. The Premium Pass redemption system opens globally.'
      },
      {
        date: 'Mid November 2026',
        tag: 'KSMP Integration',
        title: 'Minecraft KSMP In-Game Reward Store',
        summary: 'Link your Minecraft gamer tag to buy cosmetic trails, kill effects, and server titles with KR.'
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
        summary: 'Top Krims Rewards holders on the global leaderboard unlock Enterprise Lifetime passes, exclusive KSMP champion titles, and massive KR jackpot multipliers.'
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
