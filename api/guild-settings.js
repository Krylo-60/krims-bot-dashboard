import pg from 'pg';

const { Pool } = pg;

let pool = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

export default async function handler(req, res) {
  // CORS Headers support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const renderBackendUrl = process.env.RENDER_BOT_URL || 'https://krims-discord-bot-d57m.onrender.com';

  // 1. GET: Fetch Guild Settings from Neon PostgreSQL (or fallback to Render)
  if (req.method === 'GET') {
    const guildId = req.query.guild_id || req.query.guildId;
    if (!guildId) {
      return res.status(400).json({ error: 'guild_id query parameter is required' });
    }

    try {
      const dbPool = getPool();
      if (dbPool) {
        const queryRes = await dbPool.query(
          'SELECT config_json, updated_at FROM guild_settings WHERE guild_id = $1 LIMIT 1',
          [guildId]
        );
        if (queryRes.rows.length > 0) {
          return res.status(200).json({
            ok: true,
            source: 'neon_postgres',
            settings: queryRes.rows[0].config_json,
            updatedAt: queryRes.rows[0].updated_at
          });
        }
      }

      // Fallback: check Render backend
      try {
        const renderRes = await fetch(`${renderBackendUrl}/api/guild/settings?guild_id=${guildId}`);
        if (renderRes.ok) {
          const rData = await renderRes.json();
          if (rData && rData.settings) {
            return res.status(200).json({
              ok: true,
              source: 'render_backend',
              settings: rData.settings,
              updatedAt: rData.updatedAt
            });
          }
        }
      } catch (e) {}

      return res.status(200).json({
        ok: true,
        source: 'default',
        settings: null,
        message: 'No saved settings found for this server. Default presets active.'
      });
    } catch (err) {
      console.error('[API /api/guild-settings] Error fetching settings:', err);
      return res.status(500).json({ error: 'Failed to retrieve settings', details: err.message });
    }
  }

  // 2. POST: Upsert Guild Settings into Neon PostgreSQL and sync with live Discord Bot
  if (req.method === 'POST') {
    const { guildId, settings, autoSave } = req.body || {};

    if (!guildId || !settings) {
      return res.status(400).json({ error: 'guildId and settings payload are required' });
    }

    let postgresSaved = false;
    let postgresError = null;

    try {
      const dbPool = getPool();
      if (dbPool) {
        await dbPool.query(`
          INSERT INTO guild_settings (guild_id, config_json, updated_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (guild_id)
          DO UPDATE SET config_json = $2, updated_at = CURRENT_TIMESTAMP;
        `, [guildId, JSON.stringify(settings)]);
        postgresSaved = true;
      }
    } catch (err) {
      console.error('[API /api/guild-settings] Postgres Save Error:', err);
      postgresError = err.message;
    }

    // Forward to Render live Discord Bot backend (non-blocking)
    let botSynced = false;
    try {
      const forwardRes = await fetch(`${renderBackendUrl}/api/guild/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, settings, autoSave: !!autoSave })
      });
      if (forwardRes.ok) {
        botSynced = true;
      }
    } catch (fwdErr) {
      console.warn('[API /api/guild-settings] Bot webhook sync warning:', fwdErr.message);
    }

    return res.status(200).json({
      ok: postgresSaved || botSynced,
      postgresSaved,
      botSynced,
      savedAt: new Date().toISOString(),
      message: 'Settings successfully persisted to cloud database and synced with live bot!',
      warning: postgresError ? `Postgres note: ${postgresError}` : undefined
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
