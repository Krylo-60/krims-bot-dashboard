import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

let telemetryInitialized = false;

export function ensureVercelTelemetry() {
  if (telemetryInitialized || typeof window === 'undefined') return;
  telemetryInitialized = true;
  inject();
  injectSpeedInsights();
}

ensureVercelTelemetry();
