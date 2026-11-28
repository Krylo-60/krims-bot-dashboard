import { initBotId } from 'botid/client/core';

let botIdInitialized = false;

export function ensureBotIdInitialized() {
  if (botIdInitialized || typeof window === 'undefined') return;
  botIdInitialized = true;

  initBotId({
    protect: [
      { path: '/api/custom-bots', method: 'POST' },
      { path: '/api/custom-bot-auth', method: 'POST' },
      { path: '/api/broadcast', method: 'POST' },
      { path: '/api/guild-settings', method: 'POST' },
      { path: '/api/rewards', method: 'POST' },
      { path: '/api/subscribe-dm', method: 'POST' },
    ],
  });
}

ensureBotIdInitialized();
