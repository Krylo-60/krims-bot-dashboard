export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'DISCORD_TOKEN is not configured in Vercel environment' });
    return;
  }

  const { channelId, title, description, color } = req.body || {};
  if (!channelId || !title || !description) {
    res.status(400).json({ error: 'channelId, title, and description are required' });
    return;
  }

  let decimalColor = 0x00f2ff;
  if (color) {
    const cleanHex = color.replace('#', '');
    const parsed = parseInt(cleanHex, 16);
    if (!isNaN(parsed)) decimalColor = parsed;
  }

  const embedPayload = {
    embeds: [
      {
        title: title,
        description: description,
        color: decimalColor,
        footer: {
          text: 'Krylo Team • Bot Broadcast'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const discordRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(embedPayload)
    });

    if (!discordRes.ok) {
      const errBody = await discordRes.text();
      console.error('Discord API message error:', discordRes.status, errBody);
      res.status(discordRes.status).json({ error: `Discord API error: ${errBody}` });
      return;
    }

    const messageData = await discordRes.json();
    res.status(200).json({ ok: true, messageId: messageData.id });
  } catch (err) {
    console.error('Broadcast handler error:', err);
    res.status(500).json({ error: err.message });
  }
}
