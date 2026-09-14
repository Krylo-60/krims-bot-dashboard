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

  const { guild_id } = req.query;
  if (!guild_id) {
    res.status(400).json({ error: 'guild_id is required' });
    return;
  }

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'DISCORD_TOKEN is not configured' });
    return;
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guild_id}/channels`, {
      headers: { 'Authorization': `Bot ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guild channels: ${response.status}`);
    }

    const rawChannels = await response.json();

    // 1. Build category mapping with positions
    const categories = rawChannels.filter(c => c.type === 4);
    const catMap = {};
    categories.sort((a, b) => a.position - b.position);
    categories.forEach(c => {
      catMap[c.id] = { name: c.name, position: c.position };
    });

    // 2. Include all non-category channels (0: text, 2: voice, 5: announcement, 15: forum)
    const validChannels = rawChannels.filter(c => c.type !== 4);

    // 3. Sort hierarchically: by category position first, then channel position
    validChannels.sort((a, b) => {
      const posA = catMap[a.parent_id]?.position ?? 999;
      const posB = catMap[b.parent_id]?.position ?? 999;
      if (posA !== posB) return posA - posB;
      return a.position - b.position;
    });

    const channels = validChannels.map(c => {
      let icon = '#';
      let typeLabel = 'text';
      if (c.type === 2) {
        icon = '🔊';
        typeLabel = 'voice';
      } else if (c.type === 5) {
        icon = '📢';
        typeLabel = 'announcement';
      } else if (c.type === 15) {
        icon = '💬';
        typeLabel = 'forum';
      }

      return {
        id: c.id,
        name: c.name,
        type: c.type,
        typeLabel,
        icon,
        category: catMap[c.parent_id]?.name || 'General Channels',
        parentId: c.parent_id,
        position: c.position
      };
    });

    res.status(200).json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
