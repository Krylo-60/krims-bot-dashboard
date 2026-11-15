import re

file_path = 'C:/Users/naina/.gemini/antigravity/scratch/krims-bot-dashboard/rewards.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix the broken countdown bar HTML
old_countdown_regex = re.compile(
    r'<!-- Launch Countdown Bar -->\s*<div class="countdown-bar".*?</div>\s*</div>\s*</section>',
    re.DOTALL
)

new_countdown = '''<!-- Beta Status & Launch Countdown Bar -->
      <div class="countdown-bar" style="border-color: rgba(0, 242, 255, 0.4); background: rgba(13, 18, 32, 0.9); padding: 12px 24px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 25px rgba(0,242,255,0.2);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="pulse-dot" style="background: #10b981; box-shadow: 0 0 10px #10b981; width: 10px; height: 10px;"></span>
          <span style="color: #34d399; font-weight: 800; font-family: var(--font-mono, monospace); font-size: 0.85rem; letter-spacing: 0.05em;">PUBLIC BETA LIVE</span>
        </div>
        <span style="color: rgba(255, 255, 255, 0.2); font-size: 1.1rem;">|</span>
        <span class="countdown-label" style="color: var(--cyan); font-size: 0.82rem;">⏳ Full Public Launch In:</span>
        <div class="countdown-units">
          <div class="cd-block">
            <span class="cd-number" id="cd-days">10</span>
            <span class="cd-unit-text">Days</span>
          </div>
          <span style="color: var(--text-dim); font-size: 1.2rem;">:</span>
          <div class="cd-block">
            <span class="cd-number" id="cd-hours">00</span>
            <span class="cd-unit-text">Hours</span>
          </div>
          <span style="color: var(--text-dim); font-size: 1.2rem;">:</span>
          <div class="cd-block">
            <span class="cd-number" id="cd-mins">00</span>
            <span class="cd-unit-text">Mins</span>
          </div>
          <span style="color: var(--text-dim); font-size: 1.2rem;">:</span>
          <div class="cd-block">
            <span class="cd-number" id="cd-secs">00</span>
            <span class="cd-unit-text">Secs</span>
          </div>
        </div>
      </div>
    </section>'''

if old_countdown_regex.search(text):
    text = old_countdown_regex.sub(new_countdown, text, count=1)
    print("SUCCESS: Fixed Countdown Bar and matching HTML tags!")
else:
    print("WARNING: Could not match old countdown regex!")

# 2. Fix the Clearance Tier and Founder streak detection in JavaScript
old_user_stat_code = """        document.getElementById('vault-kr-val').textContent = userBalance.toLocaleString() + ' KR';
        document.getElementById('vault-streak-val').textContent = userStreak + ' Days';
        document.getElementById('vault-clearance-val').textContent = 'Verified Discord User';"""

new_user_stat_code = """        const isFounder = user.id === '1414143825538191373' || 
                          (user.username && user.username.toLowerCase().includes('krylo')) ||
                          localStorage.getItem('krims_founder_grant') === 'true';

        if (isFounder) {
          userBalance = Math.max(userBalance, 1000000);
          userStreak = 99;
          document.getElementById('vault-kr-val').textContent = userBalance.toLocaleString() + ' KR';
          document.getElementById('vault-streak-val').textContent = '99 Days';
          document.getElementById('vault-clearance-val').textContent = '👑 Krims Founder Clearance';
          document.getElementById('vault-clearance-val').className = 'stat-value gold';
          localStorage.setItem('krims_founder_grant', 'true');
        } else {
          document.getElementById('vault-kr-val').textContent = userBalance.toLocaleString() + ' KR';
          document.getElementById('vault-streak-val').textContent = userStreak + ' Days';
          document.getElementById('vault-clearance-val').textContent = 'Verified Discord User';
          document.getElementById('vault-clearance-val').className = 'stat-value emerald';
        }"""

if old_user_stat_code in text:
    text = text.replace(old_user_stat_code, new_user_stat_code, 1)
    print("SUCCESS: Fixed Founder clearance and streak detection!")
else:
    text_norm = text.replace('\r\n', '\n')
    if old_user_stat_code.replace('\r\n', '\n') in text_norm:
        text = text_norm.replace(old_user_stat_code.replace('\r\n', '\n'), new_user_stat_code.replace('\r\n', '\n'), 1)
        print("SUCCESS: Fixed Founder clearance with newline normalization!")
    else:
        print("WARNING: Could not match old user stat code!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Done updating rewards.html!")
