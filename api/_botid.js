import { checkBotId } from 'botid/server';

/**
 * Verifies the incoming request using Vercel BotID.
 * Returns true if the request is allowed to proceed, or sends 403 and returns false.
 */
export async function verifyBotId(req, res) {
  try {
    const verification = await checkBotId({
      advancedOptions: {
        headers: req.headers,
      },
    });

    if (verification.isBot) {
      res.status(403).json({
        ok: false,
        error: 'Automated bot traffic detected. Access denied.',
      });
      return false;
    }

    return true;
  } catch (err) {
    // In local dev without VERCEL_OIDC_TOKEN, checkBotId may throw; allow only in non-production
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      return true;
    }
    console.error('[BotID] Verification error:', err?.message || err);
    res.status(403).json({
      ok: false,
      error: 'Bot verification failed. Access denied.',
    });
    return false;
  }
}
