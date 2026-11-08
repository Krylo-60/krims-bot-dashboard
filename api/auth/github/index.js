export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Setup Required • Krims Code</title><style>body{background:#0A0E1A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;} .box{background:#121829;padding:32px;border-radius:12px;border:1px solid #1E293B;max-width:440px;text-align:center;} h2{color:#FF6B6B;} p{color:#94A3B8;font-size:14px;line-height:1.6;}</style></head>
      <body>
        <div class="box">
          <h2>⚙️ GitHub OAuth Not Configured</h2>
          <p>Please add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to your Vercel project environment variables.</p>
        </div>
      </body>
      </html>
    `);
  }

  const discordId = req.query.discord_id || req.query.state || '';
  const redirectUri = encodeURIComponent('https://krims-bot-dashboard.vercel.app/api/auth/github/callback');
  const state = encodeURIComponent(discordId);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user&state=${state}`;

  return res.redirect(302, authUrl);
}
