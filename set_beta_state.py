import re
from pathlib import Path

repo_dir = Path(r"C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard")

# 1. Update rewards.html
rewards_path = repo_dir / "rewards.html"
content = rewards_path.read_text(encoding="utf-8")

# A. Update Sneakpeek pill to Beta
content = re.sub(
    r'<div class="sneakpeek-pill".*?>.*?</div>',
    '''<div class="sneakpeek-pill" style="border-color: rgba(0, 242, 255, 0.45); background: rgba(0, 242, 255, 0.12); color: #00f2ff; box-shadow: 0 0 20px rgba(0, 242, 255, 0.25);">
        <span class="pulse-dot" style="background: #00f2ff; box-shadow: 0 0 10px #00f2ff;"></span>
        <span>🚀 KRIMS REWARDS PUBLIC BETA IS LIVE • EARLY ACCESS UNLOCKED</span>
      </div>''',
    content,
    flags=re.DOTALL
)

# B. Update Hero Subtitle
content = re.sub(
    r'<p class="hero-subtitle">.*?</p>',
    '''<p class="hero-subtitle">
        KryloCoins are officially retiring and transitioning into <strong>Krims Rewards (KR)</strong> with an automatic <strong>1:1 balance conversion</strong>. The <strong>Public Beta is NOW LIVE</strong>! Claim your daily bonuses, test redemption passes, and synchronize your balance across Discord and KSMP before full public launch on November 9, 2026!
      </p>''',
    content,
    flags=re.DOTALL
)

# C. Update Countdown Bar to Live Beta Status Bar
content = re.sub(
    r'<!-- Launch Countdown Bar -->\s*<div class="countdown-bar".*?>.*?</div>(\s*</div>)?',
    '''<!-- Launch Countdown Bar -->
      <div class="countdown-bar" style="border-color: rgba(0, 242, 255, 0.35); background: rgba(0, 242, 255, 0.08); padding: 14px 24px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="pulse-dot" style="background: #10b981; box-shadow: 0 0 10px #10b981; width: 10px; height: 10px;"></span>
          <span style="color: #34d399; font-weight: 800; font-family: var(--font-mono, monospace); font-size: 0.9rem; letter-spacing: 0.05em;">SYSTEM STATUS: PUBLIC BETA LIVE & ACTIVE</span>
        </div>
        <div style="color: #cbd5e1; font-size: 0.86rem; font-weight: 600;">
          Interactive Vault, Discord OAuth & Beta Daily Bonus (+250 KR) Active • Official Full Launch Nov 9
        </div>
      </div>''',
    content,
    flags=re.DOTALL
)

# D. Pass Buttons to Live Beta Unlocks
content = re.sub(r'<span>(⏳ Unlocks Next Monday|⏳ Unlocks Nov 9|✨ Unlock Sprint Pass \(2,500 KR\)|✨ Test Unlock Sprint Pass \(2,500 KR\))</span>', '<span>✨ Unlock Sprint Pass (2,500 KR)</span>', content)
content = re.sub(r'<span>(👑 Preview Pro Pass|👑 Unlock 30-Day Pro \(8,000 KR\)|👑 Test Unlock 30-Day Pro \(8,000 KR\))</span>', '<span>👑 Unlock 30-Day Pro (8,000 KR)</span>', content)
content = re.sub(r'<span>(⚡ Lifetime Clearance|⚡ Unlock Lifetime Access \(25,000 KR\)|⚡ Test Lifetime Clearance \(25,000 KR\))</span>', '<span>⚡ Unlock Lifetime Access (25,000 KR)</span>', content)

# E. Update Pass Notice Handler
new_fn = '''window.triggerPassNotice = function(passName, cost) {
      if (userBalance >= cost) {
        showToast(`🎉 Beta Access Granted: You have ${userBalance.toLocaleString()} KR! ${passName} is active for your account.`, '🚀');
      } else {
        const need = cost - userBalance;
        showToast(`You have ${userBalance.toLocaleString()} KR. Need ${need.toLocaleString()} more KR for ${passName}! Claim your daily Beta bonus above!`, '💎');
      }
    };'''
content = re.sub(r'window\.triggerPassNotice\s*=\s*function\(passName,\s*cost\)\s*\{.*?\};', new_fn, content, flags=re.DOTALL)

# F. Update navbar button text to indicate Beta
content = re.sub(
    r'<a href="/rewards" class="nav-pill-btn active">\s*<span>💎</span>\s*<span>.*?</span>\s*</a>',
    '<a href="/rewards" class="nav-pill-btn active">\n        <span>💎</span>\n        <span>Rewards (Beta)</span>\n      </a>',
    content
)

rewards_path.write_text(content, encoding="utf-8")
print("rewards.html switched to Beta!")

# 2. Update index.html navbar link
index_path = repo_dir / "index.html"
index_content = index_path.read_text(encoding="utf-8")
index_content = re.sub(
    r'<a href="/rewards" class="notifyme-nav-link"[^>]*>.*?</a>',
    '<a href="/rewards" class="notifyme-nav-link" style="color: #00f2ff; font-weight: 700; text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);">💎 Rewards (Beta)</a>',
    index_content
)
index_path.write_text(index_content, encoding="utf-8")
print("index.html updated!")

# 3. Update wiki, custombot, linked-roles navbar link
for fname in ["wiki.html", "custombot.html", "linked-roles.html"]:
    fpath = repo_dir / fname
    if fpath.exists():
        ftxt = fpath.read_text(encoding="utf-8")
        ftxt = re.sub(
            r'<a href="/rewards" class="nav-pill-btn( active)?">\s*<span>💎</span>\s*<span>.*?</span>\s*</a>',
            r'<a href="/rewards" class="nav-pill-btn\1">\n        <span>💎</span>\n        <span>Rewards (Beta)</span>\n      </a>',
            ftxt
        )
        fpath.write_text(ftxt, encoding="utf-8")
        print(f"{fname} navbar updated to Rewards (Beta)")
