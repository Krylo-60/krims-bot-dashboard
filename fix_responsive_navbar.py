import re
from pathlib import Path

repo_dir = Path(r"C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard")

NAV_CSS = """
    /* ── UNIFIED ULTRA-RESPONSIVE PILL-BUTTON NAVBAR ── */
    .top-navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      min-height: 64px;
      background: rgba(7, 10, 18, 0.90);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.5rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-sizing: border-box;
      width: 100%;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
      flex-shrink: 0;
    }

    .brand-logo-stroke {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      border: 1.5px solid #00f2ff;
      background: rgba(0, 242, 255, 0.08);
      color: #00f2ff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(0, 242, 255, 0.25);
      transition: all 0.25s ease;
      flex-shrink: 0;
    }

    .brand-group:hover .brand-logo-stroke {
      background: rgba(0, 242, 255, 0.16);
      box-shadow: 0 0 22px rgba(0, 242, 255, 0.4);
      transform: scale(1.04);
    }

    .brand-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.02rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #fff 0%, #00f2ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
      padding: 4px 2px;
    }

    .nav-links::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }

    /* Distinct Glass Card Pill Buttons */
    .nav-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .nav-pill-btn:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(0, 242, 255, 0.45);
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Active Glowing Cyan Border & Fill */
    .nav-pill-btn.active {
      background: rgba(0, 242, 255, 0.08);
      border: 1.5px solid #00f2ff;
      color: #00f2ff;
      box-shadow: 0 0 14px rgba(0, 242, 255, 0.25);
    }

    /* Electric Cyan Gradient Support CTA Button */
    .nav-cta-gradient {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 15px;
      background: linear-gradient(135deg, #00f2fe 0%, #0099ff 100%);
      color: #030712 !important;
      font-weight: 700;
      border-radius: 8px;
      font-size: 0.82rem;
      text-decoration: none;
      border: none;
      white-space: nowrap;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(0, 242, 255, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .nav-cta-gradient:hover {
      box-shadow: 0 6px 20px rgba(0, 242, 255, 0.7);
      transform: translateY(-1px);
      filter: brightness(1.08);
    }

    /* Media query adjustments for smaller screens */
    @media (max-width: 900px) {
      .nav-pill-vote {
        display: none !important;
      }
      .brand-title {
        font-size: 0.95rem;
      }
    }

    @media (max-width: 600px) {
      .top-navbar {
        padding: 0.5rem 0.75rem;
      }
      .brand-title {
        display: none;
      }
      .nav-pill-btn {
        padding: 5px 10px;
        font-size: 0.78rem;
      }
      .nav-cta-gradient {
        padding: 6px 12px;
        font-size: 0.78rem;
      }
    }
"""

def make_header(brand_title, active_tab):
    return f"""  <header class="top-navbar">
    <a href="/" class="brand-group">
      <div class="brand-logo-stroke">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z"></path>
          <path d="M11 3 8 9l4 12 4-12-3-6"></path>
          <path d="M2 9h20"></path>
        </svg>
      </div>
      <span class="brand-title">{brand_title}</span>
    </a>
    <nav class="nav-links">
      <a href="/" class="nav-pill-btn {'active' if active_tab == 'dashboard' else ''}">
        <span>🎛️</span>
        <span>Dashboard</span>
      </a>
      <a href="/rewards" class="nav-pill-btn {'active' if active_tab == 'rewards' else ''}">
        <span>💎</span>
        <span>Rewards</span>
      </a>
      <a href="/wiki" class="nav-pill-btn {'active' if active_tab == 'wiki' else ''}">
        <span>📖</span>
        <span>Wiki</span>
      </a>
      <a href="/custombot" class="nav-pill-btn {'active' if active_tab == 'custombot' else ''}">
        <span>🤖</span>
        <span>Custom Bot</span>
      </a>
      <a href="https://top.gg/bot/1523794466740371586/vote" target="_blank" class="nav-pill-btn nav-pill-vote">
        <span>🗳️</span>
        <span>Vote (2x XP)</span>
      </a>
      <a href="https://discord.gg/sYaVJtXgQb" target="_blank" class="nav-cta-gradient">
        <span>💭</span>
        <span>Support Server</span>
      </a>
    </nav>
  </header>"""

# Clean and update rewards.html
rewards_path = repo_dir / "rewards.html"
text = rewards_path.read_text(encoding="utf-8")

# Remove any old .top-navbar CSS blocks
text = re.sub(r'/\* ── 3\. TOP NAVIGATION BAR ── \*/.*?/\* ── 4\. HERO SECTION', '/* ── 3. TOP NAVIGATION BAR ── */\n' + NAV_CSS + '\n    /* ── 4. HERO SECTION', text, flags=re.DOTALL)
# Remove the .nav-links { display: none; } from @media (max-width: 768px)
text = text.replace(".nav-links { display: none; }", "/* .nav-links preserved with mobile scrolling */")

# Replace header HTML
text = re.sub(r'<header class="top-navbar">.*?</header>', make_header("KRIMS REWARDS", "rewards"), text, flags=re.DOTALL)

rewards_path.write_text(text, encoding="utf-8")
print("Cleaned and updated rewards.html")

# Update wiki.html
wiki_path = repo_dir / "wiki.html"
wtext = wiki_path.read_text(encoding="utf-8")
wtext = re.sub(r'/\* ── UNIFIED.*?\.header-center', NAV_CSS + '\n    .header-center', wtext, flags=re.DOTALL)
wtext = wtext.replace(".nav-links { display: none; }", "/* .nav-links preserved */")
wtext = re.sub(r'<header class="top-navbar">.*?</header>', make_header("KRIMS WIKI", "wiki"), wtext, flags=re.DOTALL)
wiki_path.write_text(wtext, encoding="utf-8")
print("Cleaned and updated wiki.html")

# Update custombot.html
cb_path = repo_dir / "custombot.html"
cbtext = cb_path.read_text(encoding="utf-8")
cbtext = re.sub(r'/\* ── UNIFIED.*?</style>', NAV_CSS + '\n</style>', cbtext, flags=re.DOTALL)
cbtext = re.sub(r'<header class="top-navbar">.*?</header>', make_header("CUSTOM BOT", "custombot"), cbtext, flags=re.DOTALL)
cb_path.write_text(cbtext, encoding="utf-8")
print("Cleaned and updated custombot.html")

# Update linked-roles.html
lr_path = repo_dir / "linked-roles.html"
lrtext = lr_path.read_text(encoding="utf-8")
lrtext = re.sub(r'/\* ── UNIFIED.*?</style>', NAV_CSS + '\n</style>', lrtext, flags=re.DOTALL)
lrtext = re.sub(r'<header class="top-navbar">.*?</header>', make_header("KRIMS ROLES", "roles"), lrtext, flags=re.DOTALL)
lr_path.write_text(lrtext, encoding="utf-8")
print("Cleaned and updated linked-roles.html")
