export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { userId } = req.body || {};
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({ ok: false, error: 'Please log in with Discord or provide your Discord User ID.' });
  }

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    return res.status(200).json({ 
      ok: true, 
      simulated: true,
      message: `🔔 Subscribed! You will receive Discord DM alerts at User ID ${userId}.` 
    });
  }

  try {
    // 1. Open or retrieve direct message channel with user
    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipient_id: userId.trim() })
    });

    if (!dmRes.ok) {
      const errData = await dmRes.json().catch(() => ({}));
      return res.status(400).json({
        ok: false,
        error: errData.message || 'Could not open Discord DM channel. Ensure you share a server with Krims Bot and have DMs enabled.'
      });
    }

    const dmChannel = await dmRes.json();

    // 2. Dispatch high-tech confirmation embed to their Discord DMs
    const sendRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: `✨ <@${userId}> **You are officially subscribed to Krims Rewards Drop Alerts!**`,
        embeds: [
          {
            title: '💎 Krims Rewards • Drop Alerts Activated',
            description: 
              'Greetings Operative!\n\n' +
              'Your Discord account has been enrolled to receive **Direct Message Drop Alerts**!\n\n' +
              '### 📬 What You Will Receive Here:\n' +
              '• 🚀 **Next Monday (Nov 2):** Instant notification when the **Krims Code Premium Pass Redemption** officially unlocks.\n' +
              '• ⛏️ **Mid November:** Notice when the **Minecraft KSMP In-Game Cosmetic Store** goes live.\n' +
              '• 🎁 **Bonus Multipliers:** Spontaneous 2x KR bonus events, voice lounge streak boosts, and Alpha bounties.\n\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              'Visit your dashboard rewards vault anytime: [krims-bot-dashboard.vercel.app/rewards](https://krims-bot-dashboard.vercel.app/rewards)',
            color: 0x00F2FF,
            thumbnail: {
              url: 'https://cdn.discordapp.com/avatars/1523794466740371586/a_906dd0ce7ccf09e15e48c6a5bda79fa6.gif?size=256'
            },
            footer: {
              text: 'Krims Code AI • Krims Rewards Protocol • "Dream higher, build higher."'
            },
            timestamp: new Date().toISOString()
          }
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: 'Open Rewards Hub',
                emoji: { name: '💎' },
                url: 'https://krims-bot-dashboard.vercel.app/rewards'
              },
              {
                type: 2,
                style: 5,
                label: 'Join Support Discord',
                emoji: { name: '💬' },
                url: 'https://discord.gg/sYaVJtXgQb'
              }
            ]
          }
        ]
      })
    });

    if (!sendRes.ok) {
      const errData = await sendRes.json().catch(() => ({}));
      if (errData.code === 50007) {
        return res.status(403).json({
          ok: false,
          error: 'Cannot send Direct Message. Please enable "Allow Direct Messages from server members" in your Discord Privacy settings!'
        });
      }
      return res.status(400).json({
        ok: false,
        error: errData.message || 'Failed to send Discord DM. Please check your privacy settings.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: '✅ Confirmation alert sent to your Discord DMs! Check your Discord direct messages.'
    });

  } catch (err) {
    console.error('Subscribe DM error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error while dispatching Discord DM.' });
  }
}
