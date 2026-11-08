export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(renderErrorHtml('Authorization Denied', error_description || 'You cancelled or denied the GitHub authorization request.'));
  }

  if (!code) {
    return res.status(400).send(renderErrorHtml('Missing Authorization Code', 'No authorization code was provided by GitHub.'));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).send(renderErrorHtml('Server Configuration Missing', 'GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from Vercel environment variables.'));
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: 'https://krims-bot-dashboard.vercel.app/api/auth/github/callback'
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.status(400).send(renderErrorHtml('GitHub Token Error', tokenData.error_description || tokenData.error));
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'KrimsCodeBot/6.0 (VercelServerless)'
      }
    });

    if (!userRes.ok) {
      return res.status(userRes.status).send(renderErrorHtml('Failed to Fetch Profile', 'Could not retrieve your GitHub profile details.'));
    }

    const ghUser = await userRes.json();
    const githubUsername = ghUser.login;
    const discordId = state || '';

    // 3. Notify Render bot backend to sync verified record and open dev ticket
    let syncSuccess = false;
    try {
      const renderRes = await fetch('https://krims-discord-bot-d57m.onrender.com/api/internal/verify-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discord_id: discordId,
          github_username: githubUsername,
          verification_method: 'GitHub OAuth (1-Click)',
          gh_profile: {
            name: ghUser.name,
            avatar_url: ghUser.avatar_url,
            public_repos: ghUser.public_repos,
            followers: ghUser.followers,
            created_at: ghUser.created_at
          }
        })
      });
      syncSuccess = renderRes.ok;
    } catch (renderErr) {
      console.warn('[Render Sync Warning]:', renderErr.message);
    }

    // 4. Return cyberpunk success screen
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>GitHub Authorized • Krims Code AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="/logo.png">
        <style>
          * { box-sizing: border-box; }
          body {
            background: #080C14;
            color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            background-image: 
              radial-gradient(circle at 50% 20%, rgba(0, 229, 255, 0.12), transparent 60%),
              radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08), transparent 50%);
          }
          .card {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 229, 255, 0.25);
            border-radius: 20px;
            padding: 44px 36px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 229, 255, 0.15);
            animation: fadeIn 0.4s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(16, 185, 129, 0.15);
            color: #34D399;
            padding: 8px 18px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
            border: 1px solid rgba(52, 211, 153, 0.3);
          }
          .avatar-container {
            position: relative;
            display: inline-block;
            margin-bottom: 20px;
          }
          .avatar {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            border: 3px solid #00E5FF;
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
            display: block;
          }
          .check-badge {
            position: absolute;
            bottom: 2px;
            right: 2px;
            background: #10B981;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid #080C14;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 26px;
            font-weight: 800;
            background: linear-gradient(135deg, #FFFFFF, #94A3B8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .handle {
            color: #00E5FF;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 18px;
          }
          p {
            color: #94A3B8;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 28px;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: #00E5FF;
            color: #080C14;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-weight: 800;
            font-size: 15px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3);
          }
          .btn:hover {
            background: #38BDF8;
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 229, 255, 0.5);
          }
          .footer-note {
            margin-top: 24px;
            font-size: 12px;
            color: #64748B;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">🛡️ IDENTITY VERIFIED</div>
          <div class="avatar-container">
            <img src="${ghUser.avatar_url || 'https://github.com/identicons/' + githubUsername + '.png'}" class="avatar" alt="Avatar">
            <div class="check-badge">✓</div>
          </div>
          <h1>Ownership Confirmed!</h1>
          <div class="handle">@${githubUsername}</div>
          <p>
            Your GitHub account has been authenticated via official OAuth.
            ${discordId ? `Your account is permanently locked to your Discord profile.` : ''}
            Your <strong>Verified Developer Ticket</strong> is ready in the Krims Code server!
          </p>
          <a href="https://discord.com/channels/1561174283294609479" class="btn">
            <span>Return to Discord</span>
            <span>➔</span>
          </a>
          <div class="footer-note">Krims Code AI • Autonomous Cloud Ecosystem</div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    return res.status(500).send(renderErrorHtml('Internal Server Error', err.message));
  }
}

function renderErrorHtml(title, desc) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${title} • Krims Code</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { background: #080C14; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; }
        .card { background: #121829; border: 1px solid #EF4444; border-radius: 16px; padding: 36px; max-width: 460px; width: 100%; text-align: center; }
        h1 { color: #EF4444; font-size: 22px; margin: 0 0 12px; }
        p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        a { color: #00E5FF; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>❌ ${title}</h1>
        <p>${desc}</p>
        <a href="https://discord.com/channels/1561174283294609479">Return to Krims Code Discord</a>
      </div>
    </body>
    </html>
  `;
}
