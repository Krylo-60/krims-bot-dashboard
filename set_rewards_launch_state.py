import re
import sys
import os

rewards_path = r'C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard\rewards.html'
index_path = r'C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard\index.html'

def set_state(state):
    with open(rewards_path, 'r', encoding='utf-8') as f:
        rewards_content = f.read()

    with open(index_path, 'r', encoding='utf-8') as f:
        index_content = f.read()

    if state == 'on':
        # 1. Update sneakpeek pill
        rewards_content = re.sub(
            r'<div class="sneakpeek-pill".*?>.*?</div>',
            '''<div class="sneakpeek-pill" style="border-color: rgba(16, 185, 129, 0.45); background: rgba(16, 185, 129, 0.12); color: #34d399;">
        <span class="pulse-dot" style="background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
        <span>🚀 OFFICIAL PRE-LAUNCH LIVE • KRIMS REWARDS SYSTEM ACTIVE</span>
      </div>''',
            rewards_content,
            flags=re.DOTALL
        )

        # 2. Update hero subtitle
        rewards_content = re.sub(
            r'<p class="hero-subtitle">.*?</p>',
            '''<p class="hero-subtitle">
        KryloCoins are officially retiring and transitioning into <strong>Krims Rewards (KR)</strong> with an automatic <strong>1:1 balance conversion</strong>. The Rewards Vault is now open for live claims, pass unlocks, and cross-network synchronization!
      </p>''',
            rewards_content,
            flags=re.DOTALL
        )

        # 3. Update countdown bar to Live Status Bar
        rewards_content = re.sub(
            r'<!-- Launch Countdown Bar -->\s*<div class="countdown-bar".*?>.*?</div>(\s*</div>)?',
            '''<!-- Launch Countdown Bar -->
      <div class="countdown-bar" style="border-color: rgba(16, 185, 129, 0.35); background: rgba(16, 185, 129, 0.08); padding: 14px 24px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="pulse-dot" style="background: #10b981; box-shadow: 0 0 10px #10b981; width: 10px; height: 10px;"></span>
          <span style="color: #34d399; font-weight: 800; font-family: var(--font-mono); font-size: 0.9rem; letter-spacing: 0.05em;">SYSTEM STATUS: ONLINE & ACTIVE</span>
        </div>
        <div style="color: #fff; font-size: 0.88rem; font-weight: 600;">
          Interactive Vault, Discord OAuth, & Web Alpha Bonus (+250 KR) are Live
        </div>
      </div>''',
            rewards_content,
            flags=re.DOTALL
        )

        # 4. Pass Buttons to Live Unlocks
        rewards_content = rewards_content.replace('<span>⏳ Unlocks Next Monday</span>', '<span>✨ Unlock Sprint Pass (2,500 KR)</span>')
        rewards_content = rewards_content.replace('<span>👑 Preview Pro Pass</span>', '<span>👑 Unlock 30-Day Pro (8,000 KR)</span>')
        rewards_content = rewards_content.replace('<span>⚡ Lifetime Clearance</span>', '<span>⚡ Unlock Lifetime Access (25,000 KR)</span>')

        # 5. Dynamic triggerPassNotice handler
        old_fn = '''window.triggerPassNotice = function(passName, cost) {
      showToast(`${passName} costs ${cost.toLocaleString()} KR. Official redemption unlocks Next Monday!`, '⏳');
    };'''
        new_fn = '''window.triggerPassNotice = function(passName, cost) {
      if (userBalance >= cost) {
        showToast(`🎉 Live Launch Promo: You have ${userBalance.toLocaleString()} KR! Unlocking ${passName}...`, '🚀');
      } else {
        const need = cost - userBalance;
        showToast(`You have ${userBalance.toLocaleString()} KR. Need ${need.toLocaleString()} more KR for ${passName}! Claim your daily bonus above!`, '💎');
      }
    };'''
        rewards_content = rewards_content.replace(old_fn, new_fn)

        # 6. Update index navbar link
        index_content = re.sub(
            r'<a href="/rewards" class="notifyme-nav-link"[^>]*>.*?</a>',
            '<a href="/rewards" class="notifyme-nav-link" style="color: #00f2ff; font-weight: 700; text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);">💎 Rewards (Live)</a>',
            index_content
        )
        print("Set state to LAUNCHED (ON)")

    elif state == 'off':
        # 1. Update sneakpeek pill
        rewards_content = re.sub(
            r'<div class="sneakpeek-pill".*?>.*?</div>',
            '''<div class="sneakpeek-pill">
        <span class="pulse-dot"></span>
        <span>CLASSIFIED SNEAK PEEK • REVEAL NEXT MONDAY</span>
      </div>''',
            rewards_content,
            flags=re.DOTALL
        )

        # 2. Update hero subtitle
        rewards_content = re.sub(
            r'<p class="hero-subtitle">.*?</p>',
            '''<p class="hero-subtitle">
        KryloCoins are officially retiring and transitioning into <strong>Krims Rewards (KR)</strong> with an automatic <strong>1:1 balance conversion</strong>. Starting next Monday, KR will be the single exclusive gateway to unlock Premium AI features, custom bots, and KSMP perks.
      </p>''',
            rewards_content,
            flags=re.DOTALL
        )

        # 3. Restore Countdown Bar
        rewards_content = re.sub(
            r'<!-- Launch Countdown Bar -->\s*<div class="countdown-bar".*?>.*?</div>(\s*</div>)?',
            '''<!-- Launch Countdown Bar -->
      <div class="countdown-bar">
        <span class="countdown-label">⏳ Public Reveal Launch In:</span>
        <div class="countdown-units">
          <div class="cd-block">
            <span class="cd-number" id="cd-days">05</span>
            <span class="cd-unit-text">Days</span>
          </div>
          <span style="color: var(--text-dim); font-size: 1.2rem;">:</span>
          <div class="cd-block">
            <span class="cd-number" id="cd-hours">04</span>
            <span class="cd-unit-text">Hours</span>
          </div>
          <span style="color: var(--text-dim); font-size: 1.2rem;">:</span>
          <div class="cd-block">
            <span class="cd-number" id="cd-mins">18</span>
            <span class="cd-unit-text">Mins</span>
          </div>
          <span style="color: var(--text-dim); font-size: 1.2rem;">:</span>
          <div class="cd-block">
            <span class="cd-number" id="cd-secs">29</span>
            <span class="cd-unit-text">Secs</span>
          </div>
        </div>
      </div>''',
            rewards_content,
            flags=re.DOTALL
        )

        # 4. Pass Buttons back to Pre-Launch
        rewards_content = rewards_content.replace('<span>✨ Unlock Sprint Pass (2,500 KR)</span>', '<span>⏳ Unlocks Next Monday</span>')
        rewards_content = rewards_content.replace('<span>👑 Unlock 30-Day Pro (8,000 KR)</span>', '<span>👑 Preview Pro Pass</span>')
        rewards_content = rewards_content.replace('<span>⚡ Unlock Lifetime Access (25,000 KR)</span>', '<span>⚡ Lifetime Clearance</span>')

        # 5. Handler back to Next Monday notice
        old_fn = '''window.triggerPassNotice = function(passName, cost) {
      if (userBalance >= cost) {
        showToast(`🎉 Live Launch Promo: You have ${userBalance.toLocaleString()} KR! Unlocking ${passName}...`, '🚀');
      } else {
        const need = cost - userBalance;
        showToast(`You have ${userBalance.toLocaleString()} KR. Need ${need.toLocaleString()} more KR for ${passName}! Claim your daily bonus above!`, '💎');
      }
    };'''
        new_fn = '''window.triggerPassNotice = function(passName, cost) {
      showToast(`${passName} costs ${cost.toLocaleString()} KR. Official redemption unlocks Next Monday!`, '⏳');
    };'''
        rewards_content = rewards_content.replace(old_fn, new_fn)

        # 6. Restore index navbar link
        index_content = re.sub(
            r'<a href="/rewards" class="notifyme-nav-link"[^>]*>.*?</a>',
            '<a href="/rewards" class="notifyme-nav-link">Rewards</a>',
            index_content
        )
        print("Set state to PRE-LAUNCH COUNTDOWN (OFF)")

    with open(rewards_path, 'w', encoding='utf-8') as f:
        f.write(rewards_content)

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)

if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'on'
    set_state(mode)
