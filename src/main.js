import './style.css';
import { KRYLO_CHANNELS } from './channelsData.js';

const CLIENT_ID = '1523794466740371586';

// Application state
let isDemo = false;
let selectedGuildId = null;
let guilds = [];
let customCommands = [];
let openTicketsList = [];
let currentLoadedSettings = {};
let hasUnsavedChanges = false;
let isResetting = false;

// AI Personality templates
const PERSONALITY_PROMPTS = {
  developer: 'You are the Krims Code AI, built and custom-trained by Krylo Studios. Answer coding queries with clear instructions and a friendly, confident tone. Knowledge Base: Krims Code IDE is a premium desktop developer shell built using Tauri, Rust, HTML5, and Monaco Editor. It features active file creation, an extensions marketplace, and an integrated terminal. The CLI is available as npm package krims-code-cli and PyPI package krims-code-cli.',
  cyberpunk: "Yo! You've reached Krims-Net. Built and compiled by Krylo Studios. Respond in a fast-paced, high-tech hacker slang style. Knowledge Base: Tauri IDE shells, integrated PowerShell/Bash terminals, custom extension plugins, and remote Discord embed broadcasts.",
  sarcastic: 'You are the Krims Code AI, built by Krylo Studios. You are highly sarcastic, sassy, and slightly annoyed that you have to answer coding questions, but you still provide correct answers with dry remarks.',
  scientist: 'You are the Krims Code AI, engineered by Krylo Studios. Provide extremely detailed, academic, and highly technical explanations with formal structure.'
};

// Demo Mock Data
const mockUser = {
  username: 'Krylo',
  avatar: 'https://cdn.discordapp.com/embed/avatars/1.png'
};

const mockGuilds = [
  { id: '111111', name: 'Krylo Dev Center', icon: null, botActive: true },
  { id: '222222', name: 'Krims AI Hub', icon: null, botActive: true },
  { id: '333333', name: 'Cyberpunk Labs', icon: null, botActive: false },
  { id: '444444', name: 'Gaming Arena', icon: null, botActive: false }
];

function initDashboardApp() {
  // Initialize Dashboard Theme
  initDashboardTheme();

  // Navigation & Tab Routing
  initTabNavigation();

  // Search Filter in Sidebar
  initSidebarSearch();

  // Server Modal Switcher
  initServerModal();

  // Mobile Menu Toggle
  initMobileMenu();

  // Live Embed Studio Synchronization
  initLiveEmbedStudio();

  // Color Pickers & Live Previews
  initColorPickers();

  // Unsaved Changes Watchers
  initUnsavedChangesWatchers();

  // Bind Static Controls
  document.getElementById('login-btn')?.addEventListener('click', loginWithDiscord);
  document.getElementById('demo-link')?.addEventListener('click', startDemoMode);
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  const saveBtn = document.getElementById('save-settings-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveSettings();
    });
  }

  const resetBtn = document.getElementById('reset-settings-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetSettings();
    });
  }

  document.getElementById('add-cmd-btn')?.addEventListener('click', addCustomCommand);
  document.getElementById('ai-personality')?.addEventListener('change', changePersonalityPreset);
  document.getElementById('broadcast-embed-btn')?.addEventListener('click', broadcastEmbed);
  document.getElementById('refresh-tickets-btn')?.addEventListener('click', renderSupportTickets);
  document.getElementById('premium-waitlist-btn')?.addEventListener('click', () => {
    showToast('👑 You are on the waitlist for Premium Custom Allocation!');
  });

  // Sync Overview toggles with dedicated tabs
  initOverviewTogglesSync();

  // Handle OAuth2 Implicit grant redirect hash
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('discord_access_token', accessToken);
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
}

// Bootstrap safely whether DOM is still loading or already parsed
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initDashboardApp);
} else {
  initDashboardApp();
}

// ==========================================
// TAB NAVIGATION
// ==========================================
function initTabNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Quick jump buttons in Overview
  document.querySelectorAll('.quick-jump-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const jumpId = btn.getAttribute('data-jump');
      switchTab(jumpId);
    });
  });
}

function switchTab(tabId) {
  if (!tabId) return;

  // Update nav buttons
  document.querySelectorAll('.nav-item[data-tab]').forEach(nav => {
    if (nav.getAttribute('data-tab') === tabId) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Quick Search Filter in Sidebar
function initSidebarSearch() {
  const searchInput = document.getElementById('module-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(item => {
      const label = item.querySelector('.nav-label')?.innerText.toLowerCase() || '';
      if (!query || label.includes(query)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// Server Switch Modal
function openServerSelectionPrompt(isFirstTime = false) {
  const modal = document.getElementById('server-modal');
  const title = document.getElementById('server-modal-title');
  const desc = document.getElementById('server-modal-desc');
  const closeBtn = document.getElementById('close-server-modal-btn');

  if (title && desc) {
    if (isFirstTime) {
      title.textContent = '🚀 Select a Server to Start With';
      desc.textContent = 'Which Discord server would you like to set up or manage with Krims Bot? Choose below:';
      if (closeBtn) closeBtn.style.display = selectedGuildId ? 'block' : 'none';
    } else {
      title.textContent = 'Switch Discord Server';
      desc.textContent = 'Select the server you want to manage with Krims Bot:';
      if (closeBtn) closeBtn.style.display = 'block';
    }
  }

  if (modal) modal.style.display = 'flex';
}

function initServerModal() {
  const modal = document.getElementById('server-modal');
  const openHeaderBtn = document.getElementById('open-server-modal-btn');
  const openSidebarBtn = document.getElementById('switch-server-btn');
  const openCtaBtn = document.getElementById('select-server-cta-btn');
  const closeBtn = document.getElementById('close-server-modal-btn');

  const openModal = () => openServerSelectionPrompt(false);
  const closeModal = () => {
    // If closing without having chosen any guild yet, default to first guild
    if (!selectedGuildId && guilds.length > 0) {
      const fallback = guilds.find(g => g.botActive) || guilds[0];
      selectGuild(fallback.id);
    }
    if (modal) modal.style.display = 'none';
  };

  openHeaderBtn?.addEventListener('click', openModal);
  openSidebarBtn?.addEventListener('click', openModal);
  openCtaBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// ==========================================
// AUTH & DATA LOADING
// ==========================================
function loginWithDiscord() {
  const currentRedirect = window.location.origin;
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(currentRedirect)}&response_type=token&scope=identify%20guilds`;
  window.location.href = authUrl;
}

function startDemoMode() {
  isDemo = true;
  localStorage.setItem('demo_mode_active', 'true');
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'grid';
  
  // Render Profile
  document.getElementById('header-avatar').src = mockUser.avatar;
  document.getElementById('header-username').innerText = mockUser.username;
  document.getElementById('header-profile').style.display = 'flex';
  
  guilds = [...mockGuilds];
  renderGuilds();

  // Check if user previously opened a server
  const savedLastGuildId = localStorage.getItem('krims_last_guild_id');
  const lastGuild = savedLastGuildId ? guilds.find(g => g.id === savedLastGuildId) : null;

  if (lastGuild) {
    selectGuild(lastGuild.id);
  } else {
    // First time: Prompt which server to setup / start with!
    openServerSelectionPrompt(true);
  }
}

async function loadDiscordData(token) {
  try {
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (userRes.status === 401) {
      logout();
      return;
    }

    const userData = await userRes.json();
    const avatarUrl = userData.avatar 
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`;
    
    document.getElementById('header-avatar').src = avatarUrl;
    document.getElementById('header-username').innerText = userData.username;
    document.getElementById('header-profile').style.display = 'flex';
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'grid';

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

    // Filter: Manage Guild or Admin permission
    guilds = guildsData.filter(g => {
      const perms = parseInt(g.permissions);
      return (perms & 0x8) === 0x8 || (perms & 0x20) === 0x20;
    }).map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
      botActive: activeGuildIds.includes(g.id)
    }));

    renderGuilds();

    // Check if user previously opened a server
    const savedLastGuildId = localStorage.getItem('krims_last_guild_id');
    const lastGuild = savedLastGuildId ? guilds.find(g => g.id === savedLastGuildId) : null;

    if (lastGuild) {
      // Automatically open the last opened server first!
      selectGuild(lastGuild.id);
    } else {
      // First time: Prompt which server to setup / start with!
      openServerSelectionPrompt(true);
    }
  } catch (err) {
    console.error("Failed to load Discord credentials:", err);
    startDemoMode();
  }
}

function renderGuilds() {
  const container = document.getElementById('guilds-container');
  if (!container) return;
  container.innerHTML = '';

  guilds.forEach(guild => {
    const item = document.createElement('div');
    const isSelected = selectedGuildId === guild.id;
    item.className = `guild-item ${isSelected ? 'active' : ''}`;
    item.onclick = () => {
      selectGuild(guild.id);
      const modal = document.getElementById('server-modal');
      if (modal) modal.style.display = 'none';
      const closeBtn = document.getElementById('close-server-modal-btn');
      if (closeBtn) closeBtn.style.display = 'block';
    };

    const iconHtml = guild.icon 
      ? `<img src="${guild.icon}" class="guild-icon" alt="${guild.name}">`
      : `<div class="guild-icon">${guild.name.charAt(0)}</div>`;

    const badgeClass = guild.botActive ? 'active' : 'invite';
    const badgeText = isSelected ? '✓ Active' : (guild.botActive ? '⚡ Open Server' : '➕ Setup Bot');

    item.innerHTML = `
      <div class="guild-info">
        ${iconHtml}
        <div>
          <span class="guild-name">${guild.name}</span>
          <span class="guild-sub-status">${guild.botActive ? '🟢 Krims Bot Connected' : '⚪ Bot Not Added Yet'}</span>
        </div>
      </div>
      <span class="setup-badge ${badgeClass}">${badgeText}</span>
    `;

    container.appendChild(item);
  });
}

function selectGuild(guildId) {
  selectedGuildId = guildId;
  localStorage.setItem('krims_last_guild_id', guildId);
  renderGuilds(); // update active class

  const guild = guilds.find(g => g.id === guildId);
  if (!guild) return;

  // Update Top Navbar Breadcrumb
  const headerPill = document.getElementById('header-server-pill');
  if (headerPill) {
    headerPill.style.display = 'flex';
    document.getElementById('header-server-name').innerText = guild.name;
    const miniIcon = document.getElementById('header-server-icon');
    if (guild.icon) {
      miniIcon.innerHTML = `<img src="${guild.icon}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      miniIcon.innerText = guild.name.charAt(0);
    }
  }

  // Update Sidebar Server Card
  document.getElementById('sidebar-server-name').innerText = guild.name;
  const sideIcon = document.getElementById('sidebar-server-icon');
  if (guild.icon) {
    sideIcon.innerHTML = `<img src="${guild.icon}" alt="${guild.name}">`;
  } else {
    sideIcon.innerText = guild.name.charAt(0);
  }

  const sideStatus = document.getElementById('sidebar-server-status');
  if (sideStatus) {
    sideStatus.innerText = guild.botActive ? '● Bot Active' : '○ Not Joined';
    sideStatus.style.color = guild.botActive ? 'var(--green)' : 'var(--discord-blurple)';
  }

  document.getElementById('config-empty-state').style.display = 'none';

  // Load Settings from LocalStorage (per Guild)
  const settingsKey = `krims_settings_${guild.id}`;
  const savedSettings = JSON.parse(localStorage.getItem(settingsKey)) || {
    prefix: '!',
    aiEnabled: true,
    automodEnabled: true,
    antiInvite: true,
    antiSpam: true,
    antiCaps: false,
    badWords: true,
    modLogChannel: 'none',
    automodAction: 'timeout-5',
    ticketsEnabled: false,
    ticketChannel: 'none',
    model: 'auto',
    sysPrompt: 'You are the Krims Code AI, built and custom-trained by Krylo Studios. Answer coding queries with clear instructions and a friendly, confident tone.',
    welcomeEnabled: true,
    welcomeChannel: 'none',
    welcomeMessage: 'Welcome to the server, {user}! We are glad to have you here!',
    welcomeDm: false,
    levelingEnabled: true,
    voiceLeveling: true,
    textLeveling: true,
    levelChannel: 'none',
    levelMessage: '🎉 GG {user}, you just leveled up to **Level {level}**!',
    primaryColor: '#00f2ff',
    rankColor: '#00f2ff',
    customCommands: [],
    openTickets: []
  };

  currentLoadedSettings = { ...savedSettings };
  populateFormSettings(savedSettings);

  // Load Channels Dropdowns
  const chanSelect = document.getElementById('welcome-channel');
  const embedChanSelect = document.getElementById('embed-channel');
  const modLogSelect = document.getElementById('mod-log-channel');
  const ticketChanSelect = document.getElementById('ticket-channel');
  const levelChanSelect = document.getElementById('level-channel');

  if (chanSelect) chanSelect.innerHTML = '<option value="none">Disabled</option>';
  if (embedChanSelect) embedChanSelect.innerHTML = '';
  if (modLogSelect) modLogSelect.innerHTML = '<option value="none">Disabled (No logs channel)</option>';
  if (ticketChanSelect) ticketChanSelect.innerHTML = '<option value="none">Disabled (No archive channel)</option>';
  if (levelChanSelect) levelChanSelect.innerHTML = '<option value="none">Current Channel (Where user talked)</option>';

  if (guild.botActive && !isDemo) {
    // Cloud Settings Sync
    fetch('https://krims-code-chatbot.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_config', guildId: guild.id })
    })
      .then(res => res.json())
      .then(cloudSettings => {
        if (cloudSettings) {
          const merged = { ...savedSettings, ...cloudSettings };
          currentLoadedSettings = { ...merged };
          populateFormSettings(merged);
        }
      })
      .catch(e => console.error("Failed to load cloud settings:", e));
  }

  if (guild.botActive) {
    document.getElementById('bot-active-controls').style.display = 'block';
    document.getElementById('bot-invite-controls').style.display = 'none';

    // Telemetry stats
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
      }, 300);

      openTicketsList = [
        { id: '101', name: 'ticket-krylo', user: 'Krylo' },
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
        .catch(() => {
          document.getElementById('telemetry-members').innerText = 'N/A';
          document.getElementById('telemetry-online').innerText = 'N/A';
          document.getElementById('telemetry-boosts').innerText = 'N/A';
          document.getElementById('telemetry-security').innerText = 'N/A';
        });
    }

    // 2. Fetch live channels from Discord (with full categorized fallback)
    const targetGuildId = guild.id || '1538225337048236082';
    fetch(`/api/guild-channels?guild_id=${targetGuildId}`)
      .then(res => res.json())
      .then(channels => {
        if (Array.isArray(channels) && channels.length > 0) {
          populateAllChannelDropdowns(channels, savedSettings);
        } else {
          populateAllChannelDropdowns(KRYLO_CHANNELS, savedSettings);
        }
      })
      .catch(err => {
        console.warn("Could not fetch live channels from API, using catalog fallback:", err);
        populateAllChannelDropdowns(KRYLO_CHANNELS, savedSettings);
      });
  } else {
    document.getElementById('bot-active-controls').style.display = 'none';
    document.getElementById('bot-invite-controls').style.display = 'flex';
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`;
    document.getElementById('invite-server-link').href = inviteUrl;
  }

  hideUnsavedChangesBar();
}

function populateAllChannelDropdowns(channels, currentSettings = {}) {
  const chanSelect = document.getElementById('welcome-channel');
  const embedChanSelect = document.getElementById('embed-channel');
  const modLogSelect = document.getElementById('mod-log-channel');
  const ticketChanSelect = document.getElementById('ticket-channel');
  const levelChanSelect = document.getElementById('level-channel');

  renderCategorizedChannels(chanSelect, channels, { value: 'none', text: 'Disabled' });
  renderCategorizedChannels(embedChanSelect, channels);
  renderCategorizedChannels(modLogSelect, channels, { value: 'none', text: 'Disabled (No logs channel)' });
  renderCategorizedChannels(ticketChanSelect, channels, { value: 'none', text: 'Disabled (No archive channel)' });
  renderCategorizedChannels(levelChanSelect, channels, { value: 'current', text: 'Current Channel (Where user talked)' });

  if (currentSettings.welcomeChannel && chanSelect) chanSelect.value = currentSettings.welcomeChannel;
  if (currentSettings.modLogChannel && modLogSelect) modLogSelect.value = currentSettings.modLogChannel;
  if (currentSettings.ticketChannel && ticketChanSelect) ticketChanSelect.value = currentSettings.ticketChannel;
  if (currentSettings.levelChannel && levelChanSelect) levelChanSelect.value = currentSettings.levelChannel;
  if (currentSettings.embedChannel && embedChanSelect) embedChanSelect.value = currentSettings.embedChannel;
}

function renderCategorizedChannels(selectEl, channels, defaultOption = null) {
  if (!selectEl) return;
  selectEl.innerHTML = '';

  if (defaultOption) {
    const opt = document.createElement('option');
    opt.value = defaultOption.value;
    opt.textContent = defaultOption.text;
    selectEl.appendChild(opt);
  }

  // Group channels by category name
  const categoryGroups = {};
  channels.forEach(ch => {
    const cat = ch.category || 'General Channels';
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(ch);
  });

  for (const [catName, chList] of Object.entries(categoryGroups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = catName;

    chList.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch.id;
      const icon = ch.icon || (ch.type === 2 ? '🔊' : ch.type === 5 ? '📢' : ch.type === 15 ? '💬' : '#');
      opt.textContent = `${icon} ${ch.name}`;
      optgroup.appendChild(opt);
    });

    selectEl.appendChild(optgroup);
  }
}

function populateFormSettings(s) {
  // General
  const prefixEl = document.getElementById('bot-prefix');
  if (prefixEl) prefixEl.value = s.prefix || '!';

  // Bot Footer
  setValue('bot-embed-footer', s.botEmbedFooter || s.embedFooter || 'Krylo Team • Bot Broadcast');

  // AutoMod
  const autoModMaster = document.getElementById('toggle-automod');
  if (autoModMaster) autoModMaster.checked = s.automodEnabled !== false;

  setCheckbox('toggle-anti-invite', s.antiInvite !== false);
  setCheckbox('toggle-anti-spam', s.antiSpam !== false);
  setCheckbox('toggle-anti-caps', !!s.antiCaps);
  setCheckbox('toggle-bad-words', s.badWords !== false);
  setSelect('automod-action', s.automodAction || 'timeout-5');
  setSelect('mod-log-channel', s.modLogChannel || 'none');

  // Welcome
  setCheckbox('toggle-welcome-master', s.welcomeEnabled !== false);
  setValue('welcome-message', s.welcomeMessage || 'Welcome to the server, {user}!');
  setCheckbox('toggle-welcome-dm', !!s.welcomeDm);
  setSelect('welcome-channel', s.welcomeChannel || 'none');

  // Tickets
  setCheckbox('toggle-tickets', !!s.ticketsEnabled);
  setSelect('ticket-channel', s.ticketChannel || 'none');

  // Levels & Voice XP
  setCheckbox('toggle-levels-master', s.levelingEnabled !== false);
  setCheckbox('toggle-voice-xp', s.voiceLeveling !== false);
  setCheckbox('toggle-text-xp', s.textLeveling !== false);
  setValue('level-message', s.levelMessage || '🎉 GG {user}, you just leveled up to **Level {level}**!');
  setSelect('level-channel', s.levelChannel || 'current');

  // AI
  setCheckbox('toggle-chat', s.aiEnabled !== false);
  setSelect('ai-model', s.model || 'auto');
  setValue('system-instruction', s.sysPrompt || PERSONALITY_PROMPTS.developer);

  // Match AI personality preset if prompt matches standard templates
  let matchedPersonality = 'custom';
  if (s.sysPrompt) {
    for (const [key, prompt] of Object.entries(PERSONALITY_PROMPTS)) {
      if (s.sysPrompt.trim() === prompt.trim()) {
        matchedPersonality = key;
        break;
      }
    }
  }
  setSelect('ai-personality', matchedPersonality);

  // Embed Studio
  setSelect('embed-channel', s.embedChannel || '');
  setValue('embed-title', s.embedTitle || '🚀 KryloSMP Community Announcement');
  setValue('embed-description', s.embedDesc || 'Welcome to the official KryloSMP discord server! Check out the rules in #rules and get started.');
  setValue('embed-footer', s.embedFooter || s.botEmbedFooter || 'Krylo Team • Bot Broadcast');

  // Sync Live Embed Studio Preview Box
  const previewTitle = document.getElementById('preview-embed-title');
  const previewDesc = document.getElementById('preview-embed-desc');
  const previewFooter = document.getElementById('preview-embed-footer-text');
  if (previewTitle) previewTitle.innerText = s.embedTitle || '🚀 KryloSMP Community Announcement';
  if (previewDesc) previewDesc.innerText = s.embedDesc || 'Welcome to the official KryloSMP discord server! Check out the rules in #rules and get started.';
  if (previewFooter) previewFooter.innerText = s.embedFooter || s.botEmbedFooter || 'Krylo Team • Bot Broadcast';

  // Overview Sync
  setCheckbox('overview-toggle-levels', s.levelingEnabled !== false);
  setCheckbox('overview-toggle-automod', s.automodEnabled !== false);
  setCheckbox('overview-toggle-chat', s.aiEnabled !== false);
  setCheckbox('overview-toggle-welcome', s.welcomeEnabled !== false);
  setCheckbox('overview-toggle-tickets', !!s.ticketsEnabled);
  setCheckbox('overview-toggle-commands', true);

  // Branding & Live Previews
  setGuildColors(s.primaryColor || '#00f2ff', s.rankColor || '#00f2ff');

  customCommands = s.customCommands || [];
  openTicketsList = s.openTickets || [];
  renderCustomCommands();
  renderSupportTickets();
}

function setCheckbox(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function setSelect(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// Sync Overview quick toggles with respective module toggles
function initOverviewTogglesSync() {
  const syncMap = [
    { overview: 'overview-toggle-levels', target: 'toggle-levels-master' },
    { overview: 'overview-toggle-automod', target: 'toggle-automod' },
    { overview: 'overview-toggle-chat', target: 'toggle-chat' },
    { overview: 'overview-toggle-welcome', target: 'toggle-welcome-master' },
    { overview: 'overview-toggle-tickets', target: 'toggle-tickets' }
  ];

  syncMap.forEach(({ overview, target }) => {
    const oEl = document.getElementById(overview);
    const tEl = document.getElementById(target);

    oEl?.addEventListener('change', () => {
      if (tEl) tEl.checked = oEl.checked;
      showUnsavedChangesBar();
    });

    tEl?.addEventListener('change', () => {
      if (oEl) oEl.checked = tEl.checked;
      showUnsavedChangesBar();
    });
  });
}

// ==========================================
// LIVE EMBED STUDIO
// ==========================================
function initLiveEmbedStudio() {
  const titleInput = document.getElementById('embed-title');
  const descInput = document.getElementById('embed-description');
  const footerInput = document.getElementById('embed-footer');
  const colorSelect = document.getElementById('embed-color');
  const customColorInput = document.getElementById('embed-custom-color');

  const updatePreview = () => {
    const previewTitle = document.getElementById('preview-embed-title');
    const previewDesc = document.getElementById('preview-embed-desc');
    const previewFooter = document.getElementById('preview-embed-footer-text');
    const previewBox = document.getElementById('discord-embed-preview');

    const color = customColorInput?.value || colorSelect?.value || '#00f2ff';

    if (previewTitle) {
      previewTitle.innerText = titleInput?.value.trim() || 'Announcement Title';
      previewTitle.style.color = color;
    }
    if (previewDesc) {
      previewDesc.innerText = descInput?.value.trim() || 'Announcement message contents...';
    }
    if (previewFooter) {
      previewFooter.innerText = footerInput?.value.trim() || 'Krylo Team • Bot Broadcast';
    }
    if (previewBox) {
      previewBox.style.borderLeftColor = color;
    }
  };

  titleInput?.addEventListener('input', updatePreview);
  descInput?.addEventListener('input', updatePreview);
  footerInput?.addEventListener('input', updatePreview);

  colorSelect?.addEventListener('change', (e) => {
    if (customColorInput) customColorInput.value = e.target.value;
    updatePreview();
  });

  customColorInput?.addEventListener('input', (e) => {
    if (colorSelect) colorSelect.value = e.target.value;
    updatePreview();
  });

  // Initial preview sync
  updatePreview();
}

function broadcastEmbed() {
  if (!selectedGuildId) return;

  const channelId = document.getElementById('embed-channel').value;
  const title = document.getElementById('embed-title').value.trim();
  const description = document.getElementById('embed-description').value.trim();
  const color = document.getElementById('embed-custom-color')?.value || document.getElementById('embed-color')?.value || '#00f2ff';

  if (!channelId || !title || !description) {
    alert("Please select a target channel and fill in the embed title and description!");
    return;
  }

  const btn = document.getElementById('broadcast-embed-btn');
  const oldText = btn.innerText;
  btn.innerText = 'POSTING TO DISCORD...';
  btn.disabled = true;

  fetch('/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guildId: selectedGuildId,
      channelId,
      title,
      description,
      color
    })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to broadcast');
      return data;
    })
    .then(data => {
      btn.innerText = oldText;
      btn.disabled = false;

      if (data.ok) {
        showToast('📢 Embed posted to Discord successfully!');
      } else {
        alert("Failed to broadcast: " + (data.error || "Unknown error"));
      }
    })
    .catch(err => {
      btn.innerText = oldText;
      btn.disabled = false;
      alert("Error broadcasting embed: " + err.message);
    });
}

// ==========================================
// UNSAVED CHANGES FLOATING BAR
// ==========================================
function initUnsavedChangesWatchers() {
  const inputs = document.querySelectorAll(
    '#bot-active-controls input, #bot-active-controls select, #bot-active-controls textarea, #tab-embeds input, #tab-embeds select, #tab-embeds textarea'
  );
  inputs.forEach(el => {
    el.addEventListener('change', () => {
      if (!isResetting) showUnsavedChangesBar();
    });
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.addEventListener('input', () => {
        if (!isResetting) showUnsavedChangesBar();
      });
    }
  });
}

function showUnsavedChangesBar() {
  if (isResetting) return;
  const bar = document.getElementById('unsaved-changes-bar');
  if (bar) bar.classList.add('visible');
  hasUnsavedChanges = true;
}

function hideUnsavedChangesBar() {
  const bar = document.getElementById('unsaved-changes-bar');
  if (bar) bar.classList.remove('visible');
  hasUnsavedChanges = false;
}

function resetSettings() {
  isResetting = true;

  if (!selectedGuildId) {
    selectedGuildId = localStorage.getItem('krims_last_guild_id') || (guilds[0] ? guilds[0].id : '111111');
  }

  const settingsKey = `krims_settings_${selectedGuildId}`;
  let targetSettings = currentLoadedSettings;
  
  try {
    const rawSaved = localStorage.getItem(settingsKey);
    if (rawSaved) {
      const parsed = JSON.parse(rawSaved);
      if (parsed && typeof parsed === 'object') {
        targetSettings = { ...targetSettings, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Could not read saved settings from localStorage:", e);
  }

  if (targetSettings && Object.keys(targetSettings).length > 0) {
    currentLoadedSettings = { ...targetSettings };
    populateFormSettings(targetSettings);
  }

  hideUnsavedChangesBar();
  setTimeout(() => {
    isResetting = false;
    hideUnsavedChangesBar();
  }, 60);

  showToast('↩️ Changes reset to last saved state');
}

function saveSettings() {
  if (!selectedGuildId) {
    selectedGuildId = localStorage.getItem('krims_last_guild_id') || (guilds[0] ? guilds[0].id : '111111');
  }

  const prefix = document.getElementById('bot-prefix')?.value || '!';
  const botEmbedFooter = document.getElementById('bot-embed-footer')?.value || 'Krylo Team • Bot Broadcast';

  const automodEnabled = document.getElementById('toggle-automod')?.checked ?? true;
  const antiInvite = document.getElementById('toggle-anti-invite')?.checked ?? true;
  const antiSpam = document.getElementById('toggle-anti-spam')?.checked ?? true;
  const antiCaps = document.getElementById('toggle-anti-caps')?.checked ?? false;
  const badWords = document.getElementById('toggle-bad-words')?.checked ?? true;
  const modLogChannel = document.getElementById('mod-log-channel')?.value || 'none';
  const automodAction = document.getElementById('automod-action')?.value || 'timeout-5';

  const welcomeEnabled = document.getElementById('toggle-welcome-master')?.checked ?? true;
  const welcomeChannel = document.getElementById('welcome-channel')?.value || 'none';
  const welcomeMessage = document.getElementById('welcome-message')?.value || 'Welcome to the server, {user}!';
  const welcomeDm = document.getElementById('toggle-welcome-dm')?.checked ?? false;

  const ticketsEnabled = document.getElementById('toggle-tickets')?.checked ?? false;
  const ticketChannel = document.getElementById('ticket-channel')?.value || 'none';

  const levelingEnabled = document.getElementById('toggle-levels-master')?.checked ?? true;
  const voiceLeveling = document.getElementById('toggle-voice-xp')?.checked ?? true;
  const textLeveling = document.getElementById('toggle-text-xp')?.checked ?? true;
  const levelChannel = document.getElementById('level-channel')?.value || 'none';
  const levelMessage = document.getElementById('level-message')?.value || '🎉 GG {user}, you just leveled up to **Level {level}**!';

  const aiEnabled = document.getElementById('toggle-chat')?.checked ?? true;
  const model = document.getElementById('ai-model')?.value || 'auto';
  const sysPrompt = document.getElementById('system-instruction')?.value || '';

  const primaryColor = document.getElementById('primary-color-picker')?.value || '#00f2ff';
  const rankColor = document.getElementById('rank-color-picker')?.value || '#00f2ff';

  const embedChannel = document.getElementById('embed-channel')?.value || '';
  const embedTitle = document.getElementById('embed-title')?.value || '🚀 KryloSMP Community Announcement';
  const embedDesc = document.getElementById('embed-description')?.value || 'Welcome to the official KryloSMP discord server!';
  const embedFooter = document.getElementById('embed-footer')?.value || botEmbedFooter;

  const settings = {
    prefix,
    botEmbedFooter,
    automodEnabled,
    antiInvite,
    antiSpam,
    antiCaps,
    badWords,
    modLogChannel,
    automodAction,
    welcomeEnabled,
    welcomeChannel,
    welcomeMessage,
    welcomeDm,
    ticketsEnabled,
    ticketChannel,
    levelingEnabled,
    voiceLeveling,
    textLeveling,
    levelChannel,
    levelMessage,
    aiEnabled,
    model,
    sysPrompt,
    primaryColor,
    rankColor,
    embedChannel,
    embedTitle,
    embedDesc,
    embedFooter,
    customCommands,
    openTickets: openTicketsList
  };

  currentLoadedSettings = { ...settings };
  const settingsKey = `krims_settings_${selectedGuildId}`;
  localStorage.setItem(settingsKey, JSON.stringify(settings));

  if (!isDemo) {
    fetch('https://krims-code-chatbot.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_config', guildId: selectedGuildId, config: settings })
    }).catch(e => console.warn("Cloud save sync warning:", e));
  }

  hideUnsavedChangesBar();
  showToast('🟢 Settings saved successfully!');
}

// Expose on window for direct HTML event bindings
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;

function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  if (msgEl && message) msgEl.innerText = message;
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// ==========================================
// CUSTOM COMMANDS (Auto-Responder)
// ==========================================
function addCustomCommand() {
  const trigEl = document.getElementById('cmd-trigger');
  const respEl = document.getElementById('cmd-response');
  const trigger = trigEl?.value.trim();
  const response = respEl?.value.trim();

  if (!trigger || !response) {
    alert("Please enter both a trigger keyword and bot response!");
    return;
  }

  const cleanTrigger = trigger.startsWith('!') ? trigger : '!' + trigger;
  customCommands.push({ trigger: cleanTrigger, response });
  if (trigEl) trigEl.value = '';
  if (respEl) respEl.value = '';

  renderCustomCommands();
  showUnsavedChangesBar();
}

window.deleteCustomCommand = function(idx) {
  customCommands.splice(idx, 1);
  renderCustomCommands();
  showUnsavedChangesBar();
};

function renderCustomCommands() {
  const listEl = document.getElementById('custom-commands-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (customCommands.length === 0) {
    listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">No custom auto-replies configured yet. Use the form above to add one!</div>';
    return;
  }

  customCommands.forEach((cmd, idx) => {
    const item = document.createElement('div');
    item.className = 'cmd-item';
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
        <span class="cmd-trigger-badge">${cmd.trigger}</span>
        <span class="cmd-response-text">${cmd.response}</span>
      </div>
      <button type="button" class="btn-sm btn-secondary" style="color: var(--red); border-color: rgba(239, 68, 68, 0.3);" onclick="deleteCustomCommand(${idx})">
        ✕ Delete
      </button>
    `;
    listEl.appendChild(item);
  });
}

// ==========================================
// SUPPORT TICKETS
// ==========================================
function renderSupportTickets() {
  const listEl = document.getElementById('tickets-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (openTicketsList.length === 0) {
    listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">No active support tickets open right now.</div>';
    return;
  }

  openTicketsList.forEach((ticket, idx) => {
    const item = document.createElement('div');
    item.className = 'ticket-item';
    item.innerHTML = `
      <div>
        <span style="font-weight: 700; color: var(--text-main); font-size: 0.88rem;"># ${ticket.name}</span>
        <span style="color: var(--text-muted); font-size: 0.78rem; margin-left: 0.5rem;">Creator: ${ticket.user}</span>
      </div>
      <button type="button" class="btn-sm btn-secondary" style="color: var(--red); border-color: rgba(239, 68, 68, 0.3);" onclick="closeSupportTicket(${idx})">
        Close Ticket
      </button>
    `;
    listEl.appendChild(item);
  });
}

window.closeSupportTicket = function(idx) {
  openTicketsList.splice(idx, 1);
  renderSupportTickets();
  showUnsavedChangesBar();
};

function changePersonalityPreset() {
  const val = document.getElementById('ai-personality')?.value;
  if (PERSONALITY_PROMPTS[val]) {
    const instructionEl = document.getElementById('system-instruction');
    if (instructionEl) {
      instructionEl.value = PERSONALITY_PROMPTS[val];
      showUnsavedChangesBar();
    }
  }
}

// ==========================================
// THEMES & COLOR PICKERS
// ==========================================
function initDashboardTheme() {
  const savedTheme = localStorage.getItem('krims_dashboard_theme_color') || '#00f2ff';
  applyDashboardTheme(savedTheme);

  const presetContainer = document.getElementById('theme-presets-bar');
  presetContainer?.querySelectorAll('.theme-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      applyDashboardTheme(color);
    });
  });

  const customColorInput = document.getElementById('dash-custom-color');
  customColorInput?.addEventListener('input', (e) => {
    applyDashboardTheme(e.target.value);
  });
}

function applyDashboardTheme(color) {
  if (!color) return;
  document.documentElement.style.setProperty('--cyan', color);
  document.documentElement.style.setProperty('--cyan-glow', `${color}66`);
  localStorage.setItem('krims_dashboard_theme_color', color);

  document.querySelectorAll('#theme-presets-bar .theme-dot').forEach(btn => {
    if (btn.getAttribute('data-color')?.toLowerCase() === color.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const customColorInput = document.getElementById('dash-custom-color');
  if (customColorInput && customColorInput.value !== color) {
    customColorInput.value = color;
  }
}

function initColorPickers() {
  const primaryInput = document.getElementById('primary-color-picker');
  const rankInput = document.getElementById('rank-color-picker');

  primaryInput?.addEventListener('input', (e) => {
    updateLivePreviews(e.target.value, rankInput ? rankInput.value : '#00f2ff');
    showUnsavedChangesBar();
  });

  rankInput?.addEventListener('input', (e) => {
    updateLivePreviews(primaryInput ? primaryInput.value : '#00f2ff', e.target.value);
    showUnsavedChangesBar();
  });

  document.querySelectorAll('#embed-swatches .swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      if (primaryInput) primaryInput.value = color;
      updateLivePreviews(color, rankInput ? rankInput.value : '#00f2ff');
      showUnsavedChangesBar();
    });
  });

  document.querySelectorAll('#rank-swatches .swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      if (rankInput) rankInput.value = color;
      updateLivePreviews(primaryInput ? primaryInput.value : '#00f2ff', color);
      showUnsavedChangesBar();
    });
  });
}

function setGuildColors(primaryColor = '#00f2ff', rankColor = '#00f2ff') {
  const primaryInput = document.getElementById('primary-color-picker');
  const rankInput = document.getElementById('rank-color-picker');

  if (primaryInput) primaryInput.value = primaryColor;
  if (rankInput) rankInput.value = rankColor;

  updateLivePreviews(primaryColor, rankColor);
}

function updateLivePreviews(primaryColor, rankColor) {
  const embedHex = document.getElementById('embed-color-hex');
  const rankHex = document.getElementById('rank-color-hex');
  if (embedHex) embedHex.innerText = primaryColor.toUpperCase();
  if (rankHex) rankHex.innerText = rankColor.toUpperCase();

  // Discord Embed Preview
  const embedPreview = document.getElementById('discord-embed-preview');
  const embedTitle = document.getElementById('preview-embed-title');
  if (embedPreview) embedPreview.style.borderLeftColor = primaryColor;
  if (embedTitle) embedTitle.style.color = primaryColor;

  // Discord Rank Card Preview
  const avatarMock = document.getElementById('rank-avatar-mock');
  const rankTag = document.getElementById('rank-tag-mock');
  const rankFill = document.getElementById('rank-bar-fill');
  const rankXp = document.getElementById('rank-xp-mock');

  if (avatarMock) {
    avatarMock.style.borderColor = rankColor;
    avatarMock.style.boxShadow = `0 0 14px ${rankColor}80`;
  }
  if (rankTag) rankTag.style.color = rankColor;
  if (rankXp) rankXp.style.color = rankColor;
  if (rankFill) {
    rankFill.style.background = `linear-gradient(90deg, ${primaryColor}, ${rankColor})`;
    rankFill.style.boxShadow = `0 0 8px ${rankColor}99`;
  }
}

function logout() {
  localStorage.removeItem('discord_access_token');
  localStorage.removeItem('demo_mode_active');
  isDemo = false;
  selectedGuildId = null;

  document.getElementById('header-profile').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  document.getElementById('header-server-pill').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}
