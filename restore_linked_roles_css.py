import subprocess
import re
from pathlib import Path

repo_dir = Path(r"C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard")

# Get original linked-roles.html from fae14ba
out = subprocess.check_output(['git', '-C', str(repo_dir), 'show', 'fae14ba:linked-roles.html'])
orig_content = out.decode('utf-8', errors='ignore')

# The clean original topbar navbar HTML
navbar_html = """  <header class="top-navbar">
    <a href="/" class="brand-group">
      <div class="brand-logo-stroke">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z"></path>
          <path d="M11 3 8 9l4 12 4-12-3-6"></path>
          <path d="M2 9h20"></path>
        </svg>
      </div>
      <span class="brand-title">KRIMS ROLES</span>
    </a>
    <nav class="nav-links">
      <a href="/" class="nav-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        Overview
      </a>
      <a href="/rewards" class="nav-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z"></path>
          <path d="M11 3 8 9l4 12 4-12-3-6"></path>
          <path d="M2 9h20"></path>
        </svg>
        Rewards
      </a>
      <a href="/wiki" class="nav-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path></svg>
        Wiki
      </a>
      <a href="/custombot" class="nav-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="3"></rect><circle cx="8.5" cy="16" r="1.5" fill="currentColor"></circle><circle cx="15.5" cy="16" r="1.5" fill="currentColor"></circle><path d="M12 7v4"></path><line x1="8" y1="3" x2="16" y2="3"></line></svg>
        Custom Bot
      </a>
      <a href="https://discord.gg/sYaVJtXgQb" target="_blank" class="nav-btn-discord">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        Discord
      </a>
    </nav>
  </header>"""

# Replace header in orig_content
restored = re.sub(r'<header class="top-navbar">.*?</header>', navbar_html, orig_content, flags=re.DOTALL)

# Ensure the CSS has the clean top-navbar styling without deleting the rest of the file
topbar_css = """
    /* ── TOP NAVIGATION BAR (Clean Original Signature) ── */
    .top-navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(7, 10, 18, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.85rem 1.75rem;
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
      gap: 12px;
      text-decoration: none;
      color: inherit;
      flex-shrink: 0;
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
      white-space: nowrap;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .nav-links::-webkit-scrollbar {
      display: none;
    }

    .nav-link {
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 600;
      padding: 7px 14px;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .nav-link:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
    }

    .nav-link.active {
      color: var(--cyan, #00f2ff);
      background: rgba(0, 242, 255, 0.1);
      border: 1px solid rgba(0, 242, 255, 0.3);
    }

    .nav-btn-discord {
      background: #5865f2;
      color: #fff;
      border: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .nav-btn-discord:hover {
      background: #4752c4;
      box-shadow: 0 0 15px rgba(88, 101, 242, 0.4);
      transform: translateY(-1px);
    }
"""

# Replace .top-navbar block inside style
if ".top-navbar {" in restored:
    restored = re.sub(r'\.top-navbar\s*\{.*?\}(?=\s*\.brand-group|\s*\.nav-links)', '', restored, flags=re.DOTALL)

# Inject topbar_css right after <style>
restored = restored.replace('<style>', '<style>\n' + topbar_css, 1)

# Write back to linked-roles.html
(repo_dir / "linked-roles.html").write_text(restored, encoding="utf-8")
print("linked-roles.html successfully restored with full CSS!")
