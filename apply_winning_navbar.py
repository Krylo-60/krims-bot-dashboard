import re
from pathlib import Path

repo_dir = Path(r"C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard")

NAV_STYLE = """
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
      box-shadow: 0 0 25px rgba(0, 242, 255, 0.35);
      transform: scale(1.05);
    }

    .brand-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #fff 0%, #00f2ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Distinct Glass Card Pill Buttons from Image 1 */
    .nav-pill-btn {
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
      box-shadow: 0 0 16px rgba(0, 242, 255, 0.25);
    }

    /* Winning Electric Cyan Gradient Support CTA Button */
    .nav-cta-gradient {
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

    .nav-cta-gradient:hover {
      box-shadow: 0 6px 24px rgba(0, 242, 255, 0.7);
      transform: translateY(-1px);
      filter: brightness(1.08);
    }
"""

def make_header(brand_title, active_tab):
    return f"""  <header class="top-navbar">
    <a href="/" class="brand-group">
      <div class="brand-logo-stroke">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <span>Krims Rewards</span>
      </a>
      <a href="/wiki" class="nav-pill-btn {'active' if active_tab == 'wiki' else ''}">
        <span>📖</span>
        <span>Wiki</span>
      </a>
      <a href="/custombot" class="nav-pill-btn {'active' if active_tab == 'custombot' else ''}">
        <span>🤖</span>
        <span>Custom Bot</span>
      </a>
      <a href="https://top.gg/bot/1523794466740371586/vote" target="_blank" class="nav-pill-btn">
        <span>🗳️</span>
        <span>Vote (2x XP)</span>
      </a>
      <a href="https://discord.gg/sYaVJtXgQb" target="_blank" class="nav-cta-gradient">
        <span>💭</span>
        <span>Support Server</span>
      </a>
    </nav>
  </header>"""

# 1. Update rewards.html
rewards_path = repo_dir / "rewards.html"
rewards_html = rewards_path.read_text(encoding="utf-8")
# Replace header
rewards_html = re.sub(r'<header class="top-navbar">.*?</header>', make_header("KRIMS REWARDS", "rewards"), rewards_html, flags=re.DOTALL)
# Inject/replace CSS
if ".nav-pill-btn" not in rewards_html:
    rewards_html = rewards_html.replace(".top-navbar {", NAV_STYLE + "\n    .top-navbar-old {", 1)
rewards_path.write_text(rewards_html, encoding="utf-8")
print("Updated rewards.html")

# 2. Update wiki.html
wiki_path = repo_dir / "wiki.html"
wiki_html = wiki_path.read_text(encoding="utf-8")
# Replace header
wiki_html = re.sub(r'<header class="top-navbar">.*?</header>', make_header("KRIMS WIKI", "wiki"), wiki_html, flags=re.DOTALL)
if ".nav-pill-btn" not in wiki_html:
    wiki_html = wiki_html.replace(".top-navbar {", NAV_STYLE + "\n    .top-navbar-old {", 1)
wiki_path.write_text(wiki_html, encoding="utf-8")
print("Updated wiki.html")

# 3. Update custombot.html
custombot_path = repo_dir / "custombot.html"
custombot_html = custombot_path.read_text(encoding="utf-8")
custombot_html = re.sub(r'<header class="nav-header">.*?</header>', make_header("CUSTOM BOT CORE", "custombot"), custombot_html, flags=re.DOTALL)
if ".nav-pill-btn" not in custombot_html:
    custombot_html = custombot_html.replace("</style>", NAV_STYLE + "\n</style>", 1)
custombot_path.write_text(custombot_html, encoding="utf-8")
print("Updated custombot.html")

# 4. Update linked-roles.html
linked_path = repo_dir / "linked-roles.html"
if linked_path.exists():
    linked_html = linked_path.read_text(encoding="utf-8")
    linked_html = re.sub(r'<header class="top-navbar">.*?</header>', make_header("KRIMS ROLES", "roles"), linked_html, flags=re.DOTALL)
    if ".nav-pill-btn" not in linked_html:
        linked_html = linked_html.replace("</style>", NAV_STYLE + "\n</style>", 1)
    linked_path.write_text(linked_html, encoding="utf-8")
    print("Updated linked-roles.html")
