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
