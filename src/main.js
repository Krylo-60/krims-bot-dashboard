import './style.css';

const CLIENT_ID = '1523794466740371586';
const REDIRECT_URI = 'https://krims-bot-dashboard.vercel.app'; // Deploy URL target

// Application state
let isDemo = false;
let selectedGuildId = null;
let guilds = [];

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

    // Filter: Manage Guild or Admin permission (MANAGE_GUILD = 0x20, ADMINISTRATOR = 0x8)
    guilds = guildsData.filter(g => {
      const perms = parseInt(g.permissions);
      return (perms & 0x8) === 0x8 || (perms & 0x20) === 0x20;
    }).map(g => {
      return {
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        botActive: g.id % 2 === 0 // Mock bot deployment state
      };
    });

    renderGuilds();
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

  // Load Settings from LocalStorage (per Guild)
  const settingsKey = `krims_settings_${guild.id}`;
  const savedSettings = JSON.parse(localStorage.getItem(settingsKey)) || {
    prefix: '!',
    aiEnabled: true,
    ticketsEnabled: false,
    model: 'gemini',
    sysPrompt: 'You are the Krims Code AI, built and custom-trained by the genius developer Krishiv. Answer coding queries with clear instructions and a friendly, confident tone.'
  };

  // Set form fields
  document.getElementById('bot-prefix').value = savedSettings.prefix;
  document.getElementById('toggle-chat').checked = savedSettings.aiEnabled;
  document.getElementById('toggle-tickets').checked = savedSettings.ticketsEnabled;
  document.getElementById('ai-model').value = savedSettings.model;
  document.getElementById('system-instruction').value = savedSettings.sysPrompt;

  // Handle active vs invite controls
  if (guild.botActive) {
    document.getElementById('bot-active-controls').style.display = 'block';
    document.getElementById('bot-invite-controls').style.display = 'none';
  } else {
    document.getElementById('bot-active-controls').style.display = 'none';
    document.getElementById('bot-invite-controls').style.display = 'block';
    
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

  const settingsKey = `krims_settings_${selectedGuildId}`;
  const settings = { prefix, aiEnabled, ticketsEnabled, model, sysPrompt };
  
  localStorage.setItem(settingsKey, JSON.stringify(settings));

  // Show toast alert
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function logout() {
  localStorage.removeItem('discord_access_token');
  localStorage.removeItem('demo_mode_active');
  isDemo = false;
  selectedGuildId = null;
  document.getElementById('header-profile').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
}
