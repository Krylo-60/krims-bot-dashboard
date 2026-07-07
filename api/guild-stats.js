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
    // 1. Fetch main guild details
    const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guild_id}`, {
      headers: { 'Authorization': `Bot ${token}` }
    });

    if (!guildRes.ok) {
      throw new Error(`Failed to fetch guild details: ${guildRes.status}`);
    }
    const guildData = await guildRes.json();

    // 2. Fetch preview for online member count
    let onlineCount = null;
    let memberCount = guildData.approximate_member_count;

    try {
      const previewRes = await fetch(`https://discord.com/api/v10/guilds/${guild_id}/preview`, {
        headers: { 'Authorization': `Bot ${token}` }
      });
      if (previewRes.ok) {
        const previewData = await previewRes.json();
        onlineCount = previewData.approximate_presence_count;
        memberCount = previewData.approximate_member_count || memberCount;
      }
    } catch {}

    res.status(200).json({
      name: guildData.name,
      icon: guildData.icon ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png` : null,
      memberCount: memberCount || guildData.approximate_member_count || 1,
      onlineCount: onlineCount || Math.floor((memberCount || 1) * 0.3) + 1,
      boosts: guildData.premium_subscription_count || 0,
      boostTier: guildData.premium_tier || 0,
      verificationLevel: guildData.verification_level || 0,
      features: guildData.features || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
