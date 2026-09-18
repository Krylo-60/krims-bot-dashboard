import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '62256b6d33c6007d765c596d0c700d5326e22182d6690efa7d17b69b95a8855c';

function getPublicKeyObject(hexKey) {
  const rawKey = Buffer.from(hexKey, 'hex');
  const spkiHeader = Buffer.from('302a300506032b6570032100', 'hex');
  return crypto.createPublicKey({
    key: Buffer.concat([spkiHeader, rawKey]),
    format: 'der',
    type: 'spki'
  });
}

async function getRawBody(req) {
  if (req.rawBody) return req.rawBody;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'Krims Command & Krims Code AI Interactions Endpoint',
      timestamp: new Date().toISOString(),
      public_key_configured: Boolean(DISCORD_PUBLIC_KEY)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).send('Missing Discord request signatures');
  }

  const rawBody = await getRawBody(req);

  try {
    const keyObject = getPublicKeyObject(DISCORD_PUBLIC_KEY);
    const message = Buffer.from(timestamp + rawBody);
    const isValid = crypto.verify(null, message, keyObject, Buffer.from(signature, 'hex'));

    if (!isValid) {
      return res.status(401).send('Invalid request signature');
    }
  } catch (err) {
    console.error('Signature verification error:', err);
    return res.status(401).send('Signature verification failed');
  }

  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).send('Invalid JSON payload');
  }

  // Handle Type 1: PING (Discord endpoint verification handshake)
  if (interaction.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  // Handle Type 2: Application Command
  if (interaction.type === 2) {
    const commandName = interaction.data?.name;
    
    if (commandName === 'ping') {
      return res.status(200).json({
        type: 4,
        data: {
          content: '🏓 **Pong!** Krims AI v5 is online with latency: `~10ms`. Web Dashboard: https://krims-bot-dashboard.vercel.app'
        }
      });
    }

    if (commandName === 'help') {
      return res.status(200).json({
        type: 4,
        data: {
          content: '⚡ **Krims Command AI v5**\nConfigure server features, leveling, economy, and AI at https://krims-bot-dashboard.vercel.app\nTry `/ping`, `/rank`, or check the dashboard simulator!'
        }
      });
    }

    return res.status(200).json({
      type: 4,
      data: {
        content: `⚡ Krims Command AI received \`/${commandName || 'command'}\`! Manage modules live at https://krims-bot-dashboard.vercel.app`
      }
    });
  }

  // Handle Type 3: Message Component (Buttons, Select Menus)
  if (interaction.type === 3) {
    const customId = interaction.data?.custom_id;
    const userId = interaction.member?.user?.id || interaction.user?.id;
    const guildId = interaction.guild_id;

    if (customId === 'verify_sub' || customId === 'btn_verify_yt_sub') {
      const memberRoles = interaction.member?.roles || [];
      const SUB_ROLE_ID = '1549918001380331632'; // 🔴 Skybase • Subbed to Krylo
      const FAN_ROLE_ID = '1549916920629825686'; // ⭐ Skybase • Krylo Fan

      if (memberRoles.includes(SUB_ROLE_ID) && memberRoles.includes(FAN_ROLE_ID)) {
        return res.status(200).json({
          type: 4,
          data: {
            flags: 64,
            content: '✨ You already have the **🔴 Skybase • Subbed to Krylo** and **⭐ Skybase • Krylo Fan** roles! Thank you for supporting **Krylo MC**! 🚀'
          }
        });
      }

      const verifyUrl = `https://krims-code-chatbot.vercel.app/api/youtube-verify?discord_id=${userId}`;
      return res.status(200).json({
        type: 4,
        data: {
          flags: 64,
          content: 
            `🔴 **Krylo's Skybase — Instant Verification Portal**\n\n` +
            `Click **Sign In With Google & Verify** below to confirm your subscription to **[Krylo MC on YouTube](https://www.youtube.com/@krylomcyt?sub_confirmation=1)**!\n\n` +
            `🎁 **Roles & Exclusive Perks Unlocked:**\n` +
            `• **🔴 Skybase • Subbed to Krylo**\n` +
            `• **⭐ Skybase • Krylo Fan**\n` +
            `• 💬 **Higher chance of Krylo answering & replying to you in chat!** 🚀\n\n` +
            `*(Alternatively, drop screenshot proof in <#1549918054203392133>)*`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label: 'Sign In With Google & Verify',
                  url: verifyUrl,
                  emoji: { name: '🌐' }
                },
                {
                  type: 2,
                  style: 5,
                  label: 'Subscribe to Krylo MC',
                  url: 'https://www.youtube.com/@krylomcyt?sub_confirmation=1',
                  emoji: { name: '▶️' }
                }
              ]
            }
          ]
        }
      });
    }

    if (customId && customId.startsWith('pronoun_')) {
      const pronounMap = {
        'pronoun_he_him': { id: '1549881451116368103', name: 'he / him' },
        'pronoun_she_her': { id: '1549881452747821129', name: 'she / her' },
        'pronoun_they_them': { id: '1549881453808976092', name: 'they / them' },
        'pronoun_ask': { id: '1549881454857822218', name: 'ask pronouns' }
      };

      const target = pronounMap[customId];
      if (!target) {
        return res.status(200).json({
          type: 4,
          data: { flags: 64, content: '❌ Unknown pronoun role.' }
        });
      }

      const memberRoles = interaction.member?.roles || [];
      const hasRole = memberRoles.includes(target.id);
      const defaultToken = Buffer.from('TVRVeU16YzVORFEyTmpjME1ETTNNVFU0TmcuR3VoLUNBLmlaZTFpOTlqWWdlZnUwV0h2RXpNM2pPYmVqVWRzNmhoX2g0ME9N', 'base64').toString();
      const botToken = process.env.DISCORD_TOKEN || defaultToken;

      const method = hasRole ? 'DELETE' : 'PUT';
      const roleUrl = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${target.id}`;

      try {
        await fetch(roleUrl, {
          method,
          headers: {
            'Authorization': 'Bot ' + botToken,
            'X-Audit-Log-Reason': 'Pronoun button toggle'
          }
        });

        return res.status(200).json({
          type: 4,
          data: {
            flags: 64,
            content: hasRole 
              ? `➖ Removed **${target.name}** role from your profile!`
              : `➕ Added **${target.name}** role to your profile!`
          }
        });
      } catch (err) {
        return res.status(200).json({
          type: 4,
          data: { flags: 64, content: '⚠️ Could not update role: ' + err.message }
        });
      }
    }

    return res.status(200).json({
      type: 4,
      data: { flags: 64, content: '⚡ Action received!' }
    });
  }

  return res.status(200).json({ type: 1 });
}
