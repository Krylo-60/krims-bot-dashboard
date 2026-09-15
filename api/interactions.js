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

  return res.status(200).json({ type: 1 });
}
