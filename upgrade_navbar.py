import re
from pathlib import Path

dashboard_dir = Path(r"C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard")

# The unified winning navbar CSS (Image 1 style buttons + cyan gradient CTA + Rewards ambient backdrop)
NAV_CSS = """
    /* ── UNIFIED WINNING PILL-BUTTON NAVBAR (Image 1 Cyber Architecture) ── */
    .top-navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 68px;
      background: rgba(7, 10, 18, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo-stroke {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1.5px solid var(--cyan, #00f2ff);
      background: rgba(0, 242, 255, 0.08);
      color: var(--cyan, #00f2ff);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(0, 242, 255, 0.25);
      transition: all 0.25s ease;
      flex-shrink: 0;
    }

    .brand-group:hover .brand-logo-stroke {
      background: rgba(0, 242, 255, 0.16);
      box-shadow: 0 0 25px rgba(0, 242, 255, 0.35);
      transform: scale(1.05);
    }

    .brand-title {
      font-family: var(--font-display, 'Orbitron', sans-serif);
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #fff 0%, var(--cyan, #00f2ff) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Distinct Glass Card Pill Buttons from Image 1 */
    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 15px;
      background: rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 9px;
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(0, 242, 255, 0.45);
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Active Glowing Cyan Border & Fill */
    .nav-link.active {
      background: rgba(0, 242, 255, 0.08);
      border: 1.5px solid var(--cyan, #00f2ff);
      color: var(--cyan, #00f2ff);
      box-shadow: 0 0 16px rgba(0, 242, 255, 0.25);
    }

    /* Winning Electric Cyan Gradient Support CTA Button */
    .nav-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 18px;
      background: linear-gradient(135deg, #00f2fe 0%, #0099ff 100%);
      color: #030712 !important;
      font-weight: 700;
      border-radius: 9px;
      font-size: 0.84rem;
      text-decoration: none;
      border: none;
      box-shadow: 0 4px 16px rgba(0, 242, 255, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .nav-btn-primary:hover {
      box-shadow: 0 6px 24px rgba(0, 242, 255, 0.7);
      transform: translateY(-1px);
      filter: brightness(1.08);
    }
"""

def generate_nav_html(active_tab="rewards"):
    return f"""<header class="top-navbar">
    <a href="/" class="brand-group">
      <div class="brand-logo-stroke">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z"></path>
          <path d="M11 3 8 9l4 12 4-12-3-6"></path>
          <path d="M2 9h20"></path>
        </svg>
      </div>
      <span class="brand-title">KRIMS CODE</span>
    </a>
    <nav class="nav-links">
      <a href="/" class="nav-link {'active' if active_tab == 'dashboard' else ''}">
        🎛️ Dashboard
      </a>
      <a href="/rewards" class="nav-link {'active' if active_tab == 'rewards' else ''}">
        💎 Krims Rewards
      </a>
      <a href="/wiki" class="nav-link {'active' if active_tab == 'wiki' else ''}">
        📖 Wiki
      </a>
      <a href="/custombot" class="nav-link {'active' if active_tab == 'custombot' else ''}">
        🤖 Custom Bot
      </a>
      <a href="https://top.gg/bot/1523794466740371586/vote" target="_blank" class="nav-link">
        🗳️ Vote (2x XP)
      </a>
      <a href="https://discord.gg/sYaVJtXgQb" target="_blank" class="nav-btn-primary">
        💭 Support Server
      </a>
    </nav>
  </header>"""

print("Helper ready")
