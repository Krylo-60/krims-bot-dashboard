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

    const channels = await response.json();
    // Filter for text channels (type === 0)
    const textChannels = channels
      .filter(c => c.type === 0)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.status(200).json(textChannels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
