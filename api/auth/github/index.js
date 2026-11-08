export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liolLppZdQyBwxV4';
  const discordId = req.query.discord_id || req.query.state || '';
  const redirectUri = encodeURIComponent('https://krims-bot-dashboard.vercel.app/api/auth/github/callback');
  const state = encodeURIComponent(discordId);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user&state=${state}`;

  return res.redirect(302, authUrl);
}
