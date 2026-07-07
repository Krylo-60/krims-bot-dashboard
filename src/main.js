import './style.css';

const CLIENT_ID = '1523794466740371586';

// Application state
let isDemo = false;
let selectedGuildId = null;
let guilds = [];
let customCommands = [];
let openTicketsList = [];
let consoleInterval = null;
let oscilloscopeId = null;

// Demo Mock Data
const mockUser = {
  username: 'Krishiv',
  avatar: 'https://cdn.discordapp.com/embed/avatars/1.png'
};

const mockGuilds = [
  { id: '111111', name: 'Krishiv Dev Center', icon: null, botActive: true },
  { id: '222222', name: 'Krims AI Hub', icon: null, botActive: true },
  { id: '333333', name: 'Cyberpunk Labs', icon: null, botActive: false },
  { id: '444444', name: 'Gaming Arena', icon: null, botActive: false }
];

// Initialize listeners on DOM load
window.addEventListener('DOMContentLoaded', () => {
  // Bind Static Controls
  document.getElementById('login-btn').addEventListener('click', loginWithDiscord);
  document.getElementById('demo-link').addEventListener('click', startDemoMode);
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('add-cmd-btn').addEventListener('click', addCustomCommand);
  document.getElementById('toggle-tickets').addEventListener('change', renderSupportTickets);

  // Handle OAuth2 Implicit grant redirect hash
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('discord_access_token', accessToken);
      // Clean the URL hash
      history.replaceState("", document.title, window.location.pathname);
    }
  }

  const token = localStorage.getItem('discord_access_token');
  const demoModeActive = localStorage.getItem('demo_mode_active');
  
  if (token) {
    loadDiscordData(token);
  } else if (demoModeActive === 'true') {
    startDemoMode();
  }

  // Start visual oscilloscope
  startOscilloscope();
});

function loginWithDiscord() {
  const currentRedirect = window.location.origin; // Dynamically resolve redirect to match current host
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(currentRedirect)}&response_type=token&scope=identify%20guilds`;
  window.location.href = authUrl;
}

function startDemoMode() {
  isDemo = true;
  localStorage.setItem('demo_mode_active', 'true');
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'block';
  
  // Render Profile
  document.getElementById('header-avatar').src = mockUser.avatar;
  document.getElementById('header-username').innerText = mockUser.username;
  document.getElementById('header-profile').style.display = 'flex';
  document.getElementById('welcome-title').innerText = `WELCOME, ${mockUser.username.toUpperCase()}`;
  
  guilds = [...mockGuilds];
  renderGuilds();
  startTerminalConsole();
}

async function loadDiscordData(token) {
  try {
    // Fetch User profile
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (userRes.status === 401) {
      logout();
      return;
    }

    const userData = await userRes.json();
    
    // Show profile in header
    const avatarUrl = userData.avatar 
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`;
    
    document.getElementById('header-avatar').src = avatarUrl;
    document.getElementById('header-username').innerText = userData.username;
    document.getElementById('header-profile').style.display = 'flex';
    document.getElementById('welcome-title').innerText = `WELCOME, ${userData.username.toUpperCase()}`;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';

    // Fetch User Guilds
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const guildsData = await guildsRes.json();

    // Fetch active bot guilds from secure Vercel API
    let activeGuildIds = [];
    try {
      const activeRes = await fetch('/api/bot-guilds');
      if (activeRes.ok) {
        activeGuildIds = await activeRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch active bot guilds:", e);
    }

    // Filter: Manage Guild or Admin permission (MANAGE_GUILD = 0x20, ADMINISTRATOR = 0x8)
    guilds = guildsData.filter(g => {
      const perms = parseInt(g.permissions);
      return (perms & 0x8) === 0x8 || (perms & 0x20) === 0x20;
    }).map(g => {
      return {
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        botActive: activeGuildIds.includes(g.id)
      };
    });

    renderGuilds();
    startTerminalConsole();
  } catch (err) {
    console.error("Failed to load Discord credentials:", err);
    startDemoMode(); // Fallback to demo mode on network fail
  }
}

function renderGuilds() {
  const container = document.getElementById('guilds-container');
  container.innerHTML = '';

  guilds.forEach(guild => {
    const item = document.createElement('div');
    item.className = `guild-item ${selectedGuildId === guild.id ? 'active' : ''}`;
    item.onclick = () => selectGuild(guild.id);

    const iconHtml = guild.icon 
      ? `<img src="${guild.icon}" class="guild-icon" alt="${guild.name}">`
      : `<div class="guild-icon">${guild.name.charAt(0)}</div>`;

    const badgeClass = guild.botActive ? 'active' : 'invite';
    const badgeText = guild.botActive ? 'Configured' : 'Setup Bot';

    item.innerHTML = `
      <div class="guild-info">
        ${iconHtml}
        <span class="guild-name">${guild.name}</span>
      </div>
      <span class="setup-badge ${badgeClass}">${badgeText}</span>
    `;

    container.appendChild(item);
  });
}

function selectGuild(guildId) {
  selectedGuildId = guildId;
  renderGuilds(); // update active styling

  const guild = guilds.find(g => g.id === guildId);
  if (!guild) return;

  document.getElementById('config-empty-state').style.display = 'none';
  document.getElementById('config-panel').style.display = 'block';
  document.getElementById('config-guild-name').innerText = `🛠️ ${guild.name.toUpperCase()}`;

  // Load Settings from LocalStorage (per Guild) first as fallback
  const settingsKey = `krims_settings_${guild.id}`;
  const savedSettings = JSON.parse(localStorage.getItem(settingsKey)) || {
    prefix: '!',
    aiEnabled: true,
    ticketsEnabled: false,
    model: 'gemini',
    sysPrompt: 'You are the Krims Code AI, built and custom-trained by the genius developer Krishiv. Answer coding queries with clear instructions and a friendly, confident tone.',
    welcomeChannel: 'none',
    welcomeMessage: 'Welcome to the server, {user}!',
    customCommands: [],
    openTickets: []
  };

  // Set form fields
  document.getElementById('bot-prefix').value = savedSettings.prefix;
  document.getElementById('toggle-chat').checked = savedSettings.aiEnabled;
  document.getElementById('toggle-tickets').checked = savedSettings.ticketsEnabled;
  document.getElementById('ai-model').value = savedSettings.model;
  document.getElementById('system-instruction').value = savedSettings.sysPrompt;
  document.getElementById('welcome-message').value = savedSettings.welcomeMessage || 'Welcome to the server, {user}!';
  customCommands = savedSettings.customCommands || [];
  openTicketsList = savedSettings.openTickets || [];
  renderCustomCommands();
  renderSupportTickets();

  // Load welcome channels select dropdown
  const chanSelect = document.getElementById('welcome-channel');
  chanSelect.innerHTML = '<option value="none">Disabled</option>';

  // Load configuration from cloud database
  if (guild.botActive && !isDemo) {
    fetch('https://krims-code-chatbot.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_config', guildId: guild.id })
    })
      .then(res => res.json())
      .then(cloudSettings => {
        if (cloudSettings) {
          document.getElementById('bot-prefix').value = cloudSettings.prefix || '!';
          document.getElementById('toggle-chat').checked = cloudSettings.aiEnabled !== false;
          document.getElementById('toggle-tickets').checked = !!cloudSettings.ticketsEnabled;
          document.getElementById('ai-model').value = cloudSettings.model || 'gemini';
          document.getElementById('system-instruction').value = cloudSettings.sysPrompt || 'You are the Krims Code AI, built and custom-trained by the genius developer Krishiv. Answer coding queries with clear instructions and a friendly, confident tone.';
          document.getElementById('welcome-message').value = cloudSettings.welcomeMessage || 'Welcome to the server, {user}!';
          chanSelect.value = cloudSettings.welcomeChannel || 'none';
          customCommands = cloudSettings.customCommands || [];
          openTicketsList = cloudSettings.openTickets || [];
          renderCustomCommands();
          renderSupportTickets();
        }
      })
      .catch(e => console.error("Failed to load cloud settings:", e));
  }

  if (guild.botActive) {
    document.getElementById('bot-active-controls').style.display = 'block';
    document.getElementById('bot-invite-controls').style.display = 'none';
    document.getElementById('telemetry-widget').style.display = 'block';

    // Set loading placeholders
    document.getElementById('telemetry-members').innerText = '...';
    document.getElementById('telemetry-online').innerText = '...';
    document.getElementById('telemetry-boosts').innerText = '...';
    document.getElementById('telemetry-security').innerText = '...';

    if (isDemo) {
      setTimeout(() => {
        document.getElementById('telemetry-members').innerText = '148';
        document.getElementById('telemetry-online').innerText = '42';
        document.getElementById('telemetry-boosts').innerText = 'Tier 1 (2)';
        document.getElementById('telemetry-security').innerText = 'Medium';
      }, 400);

      const mockChannels = [
        { id: '123', name: 'general' },
        { id: '456', name: 'bot-commands' },
        { id: '789', name: 'welcome-logs' }
      ];
      mockChannels.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.innerText = `# ${c.name}`;
        chanSelect.appendChild(opt);
      });
      chanSelect.value = savedSettings.welcomeChannel || 'none';

      // Mock some support tickets in demo mode
      openTicketsList = [
        { id: '101', name: 'ticket-krylo', user: 'Krishiv' },
        { id: '102', name: 'ticket-support', user: '@J_dangle' }
      ];
      renderSupportTickets();
    } else {
      // 1. Fetch live telemetry statistics
      fetch(`/api/guild-stats?guild_id=${guild.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          document.getElementById('telemetry-members').innerText = data.memberCount.toLocaleString();
          document.getElementById('telemetry-online').innerText = data.onlineCount.toLocaleString();
          document.getElementById('telemetry-boosts').innerText = `Tier ${data.boostTier} (${data.boosts})`;
          
          const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Highest'];
          document.getElementById('telemetry-security').innerText = verificationLevels[data.verificationLevel] || 'Unknown';
        })
        .catch(err => {
          console.error("Failed to load telemetry stats:", err);
          document.getElementById('telemetry-members').innerText = 'N/A';
          document.getElementById('telemetry-online').innerText = 'N/A';
          document.getElementById('telemetry-boosts').innerText = 'N/A';
          document.getElementById('telemetry-security').innerText = 'N/A';
        });

      // 2. Fetch live text channels for dropdown
      fetch(`/api/guild-channels?guild_id=${guild.id}`)
        .then(res => res.json())
        .then(channels => {
          if (Array.isArray(channels)) {
            channels.forEach(c => {
              const opt = document.createElement('option');
              opt.value = c.id;
              opt.innerText = `# ${c.name}`;
              chanSelect.appendChild(opt);
            });
            chanSelect.value = savedSettings.welcomeChannel || 'none';
          }
        })
        .catch(err => console.error("Failed to load guild channels:", err));
    }
  } else {
    document.getElementById('bot-active-controls').style.display = 'none';
    document.getElementById('bot-invite-controls').style.display = 'block';
    document.getElementById('telemetry-widget').style.display = 'none';
    
    // Generate direct invite URL with guild_id parameter
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`;
    document.getElementById('invite-server-link').href = inviteUrl;
  }
}

function saveSettings() {
  if (!selectedGuildId) return;

  const prefix = document.getElementById('bot-prefix').value || '!';
  const aiEnabled = document.getElementById('toggle-chat').checked;
  const ticketsEnabled = document.getElementById('toggle-tickets').checked;
  const model = document.getElementById('ai-model').value;
  const sysPrompt = document.getElementById('system-instruction').value;
  const welcomeChannel = document.getElementById('welcome-channel').value;
  const welcomeMessage = document.getElementById('welcome-message').value;

  const settingsKey = `krims_settings_${selectedGuildId}`;
  const settings = { prefix, aiEnabled, ticketsEnabled, model, sysPrompt, welcomeChannel, welcomeMessage, customCommands, openTickets: openTicketsList };
  
  localStorage.setItem(settingsKey, JSON.stringify(settings));

  // Save to live cloud database if not in demo mode
  if (!isDemo) {
    fetch('https://krims-code-chatbot.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_config', guildId: selectedGuildId, config: settings })
    })
      .catch(e => console.error("Failed to save settings to cloud database:", e));
  }

  // Show toast alert
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function addCustomCommand() {
  const trigEl = document.getElementById('cmd-trigger');
  const respEl = document.getElementById('cmd-response');
  const trigger = trigEl.value.trim();
  const response = respEl.value.trim();

  if (!trigger || !response) return;

  // Prefix handling
  const cleanTrigger = trigger.startsWith('!') ? trigger : '!' + trigger;

  // Add and reset inputs
  customCommands.push({ trigger: cleanTrigger, response });
  trigEl.value = '';
  respEl.value = '';
  renderCustomCommands();
}

window.deleteCustomCommand = function(idx) {
  customCommands.splice(idx, 1);
  renderCustomCommands();
};

function renderCustomCommands() {
  const listEl = document.getElementById('custom-commands-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (customCommands.length === 0) {
    listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 0.2rem 0;">No custom commands defined yet.</div>';
    return;
  }

  customCommands.forEach((cmd, idx) => {
    const row = document.createElement('div');
    row.style = 'display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); margin-top: 0.25rem;';
    row.innerHTML = `
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
        <span style="color: var(--cyan); font-weight: bold;">${cmd.trigger}</span> 
        <span style="color: var(--text-muted); margin: 0 0.5rem;">➔</span> 
        <span style="color: var(--text);">${cmd.response}</span>
      </div>
      <button type="button" style="background: none; border: none; color: #ff5555; cursor: pointer; font-size: 0.85rem; font-weight: bold; padding: 0.2rem 0.5rem;" onclick="deleteCustomCommand(${idx})">DELETE</button>
    `;
    listEl.appendChild(row);
  });
}

function renderSupportTickets() {
  const cardEl = document.getElementById('tickets-card');
  const listEl = document.getElementById('tickets-list');
  if (!cardEl || !listEl) return;

  const ticketsEnabled = document.getElementById('toggle-tickets').checked;
  if (ticketsEnabled) {
    cardEl.style.display = 'block';
    listEl.innerHTML = '';
    
    if (openTicketsList.length === 0) {
      listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">No active support tickets.</div>';
      return;
    }

    openTicketsList.forEach((ticket, idx) => {
      const row = document.createElement('div');
      row.style = 'display: flex; align-items: center; justify-content: space-between; background: rgba(0, 242, 255, 0.02); padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid rgba(0, 242, 255, 0.1); margin-top: 0.25rem;';
      row.innerHTML = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
          <span style="color: var(--text); font-weight: bold;"># ${ticket.name}</span>
          <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.5rem;">Creator: ${ticket.user}</span>
        </div>
        <button type="button" style="background: none; border: none; color: #ff5555; cursor: pointer; font-size: 0.85rem; font-weight: bold; padding: 0.2rem 0.5rem;" onclick="closeSupportTicket(${idx})">CLOSE CHANNEL</button>
      `;
      listEl.appendChild(row);
    });
  } else {
    cardEl.style.display = 'none';
  }
}

window.closeSupportTicket = function(idx) {
  openTicketsList.splice(idx, 1);
  renderSupportTickets();
  saveSettings();
};

function logout() {
  localStorage.removeItem('discord_access_token');
  localStorage.removeItem('demo_mode_active');
  isDemo = false;
  selectedGuildId = null;
  
  if (consoleInterval) {
    clearInterval(consoleInterval);
    consoleInterval = null;
  }

  if (oscilloscopeId) {
    cancelAnimationFrame(oscilloscopeId);
    oscilloscopeId = null;
  }

  document.getElementById('header-profile').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
}

// Bot Console Terminal Simulator
function startTerminalConsole() {
  const consoleEl = document.getElementById('terminal-console');
  if (!consoleEl) return;
  consoleEl.innerHTML = '';
  
  const initialLogs = [
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Gateway initialization complete. Node.js runtime ready.`,
    `[${new Date().toLocaleTimeString()}] [INFO] Attempting connection to Discord Gateway...`,
    `[${new Date().toLocaleTimeString()}] [INFO] [+] Krims Code Discord Bot online as Krims Code AI#7945`,
    `[${new Date().toLocaleTimeString()}] [TELEMETRY] Trigrams database synchronized. localVocabSize: 445 words.`,
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Connected to serverless router mesh: https://krims-code-chatbot.vercel.app`
  ];

  initialLogs.forEach(log => {
    const line = document.createElement('div');
    line.innerText = log;
    consoleEl.appendChild(line);
  });
  consoleEl.scrollTop = consoleEl.scrollHeight;

  // Clear existing interval
  if (consoleInterval) clearInterval(consoleInterval);

  const mockUsers = ['@krylo_blox', '@J_dangle', '@VANGUARD', '@Fiforious', '@Jitesh'];
  const mockQueries = ['!ask write a JavaScript counter', 'hello bot', '1+1', '!diagnose', 'reset', 'help'];

  consoleInterval = setInterval(() => {
    const time = new Date().toLocaleTimeString();
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const query = mockQueries[Math.floor(Math.random() * mockQueries.length)];

    let logText = '';
    const roll = Math.random();

    if (roll < 0.35) {
      logText = `[${time}] [COMMAND] User ${user} invoked query: "${query}"`;
    } else if (roll < 0.65) {
      const isMath = query === '1+1';
      if (isMath) {
        logText = `[${time}] [MATH ENGINE] Instantly evaluated expression locally in JS: "1+1" => "2". Response sent.`;
      } else if (query === '!diagnose') {
        logText = `[${time}] [TELEMETRY] Diagnostics request processed. Served network telemetry embed payload.`;
      } else {
        const latency = (0.2 + Math.random() * 0.8).toFixed(3);
        logText = `[${time}] [AI ROUTER] Query processed using Gemini-Engine. Latency: ${latency}s.`;
      }
    } else if (roll < 0.8) {
      logText = `[${time}] [GATEWAY] Gateway connection heartbeat ACK received.`;
    } else {
      logText = `[${time}] [DB CONFIG] Read Welcome settings: activeChannel: ${Math.random() > 0.5 ? 'general' : 'welcome-logs'}.`;
    }

    const line = document.createElement('div');
    line.innerText = logText;
    consoleEl.appendChild(line);

    while (consoleEl.children.length > 50) {
      consoleEl.removeChild(consoleEl.firstChild);
    }
    
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }, 4000);
}

// Gateway Oscilloscope Waveform Animation
function startOscilloscope() {
  const canvas = document.getElementById('oscilloscope');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  let phase = 0;
  
  function draw() {
    if (!document.getElementById('telemetry-widget') || document.getElementById('telemetry-widget').style.display === 'none') {
      oscilloscopeId = requestAnimationFrame(draw);
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Draw oscilloscope residual sine wave
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 242, 255, 0.8)';
    
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const angle = (x / canvas.width) * Math.PI * 4 + phase;
      const y = (canvas.height / 2) + Math.sin(angle) * (Math.cos(phase * 0.5) * 12 + 4);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    ctx.shadowBlur = 0; // reset
    
    phase += 0.05;
    
    // Update simulated ping
    if (Math.random() < 0.015) {
      const pingVal = Math.floor(35 + Math.random() * 25);
      const pingEl = document.getElementById('oscilloscope-ping');
      if (pingEl) pingEl.innerText = `PING: ${pingVal}ms`;
    }
    
    oscilloscopeId = requestAnimationFrame(draw);
  }
  
  if (oscilloscopeId) cancelAnimationFrame(oscilloscopeId);
  draw();
}
