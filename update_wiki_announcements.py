import re
from pathlib import Path

wiki_path = Path(r"C:\Users\naina\.gemini\antigravity\scratch\krims-bot-dashboard\wiki.html")
content = wiki_path.read_text(encoding="utf-8")

# 1. Update Stepper in persistent-updates
v56_entry = """            <div class="step-item" style="border-color: rgba(0, 242, 255, 0.75); box-shadow: 0 0 25px rgba(0, 242, 255, 0.25);">
              <div class="step-number" style="background: rgba(0, 242, 255, 0.35); color: #00f2ff; font-weight: 800;">v5.6</div>
              <div class="step-body">
                <h4>Krims Code v5.6.0 • October 2026 Month-End Mega Update & Krims Rewards Public Beta (October 29, 2026) <span style="background: #10b981; color: #000; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 8px;">LATEST</span></h4>
                <p>• <strong>Krims Rewards (KR) Public Beta Launched:</strong> Official transition from KryloCoins into Krims Rewards (KR) with seamless 1:1 balance migration. Interactive Web Vault & daily bonus claims (+250 KR/day) now live at <a href="/rewards" style="color: #00f2ff; font-weight: 700;">krims-bot-dashboard.vercel.app/rewards</a>.<br>
                • <strong>Discord Linked Roles Verification Engine:</strong> Full OAuth2 profile integration linking player metadata, KR vault balances, and KSMP whitelist status directly to Discord profile badges with +250 KR bonus at <a href="/linked-roles" style="color: #00f2ff; font-weight: 700;">/linked-roles</a>.<br>
                • <strong>Dedicated Custom Bot Spawner Hub:</strong> Deploy private, isolated bot instances running Krims Code AI neural logic with custom branding and automated AutoMod rulebooks at <a href="/custombot" style="color: #00f2ff; font-weight: 700;">/custombot</a>.<br>
                • <strong>New Month-End Command Suite:</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;💎 <code>/kr-rain</code> — Launch high-intensity chat coin rain drops in active text and voice channels.<br>
                &nbsp;&nbsp;&nbsp;&nbsp;🎨 <code>/imagine</code> — Neural AI image generation powered by Krims high-resolution rendering.<br>
                &nbsp;&nbsp;&nbsp;&nbsp;🌈 <code>/color</code> — Unlock and equip custom Discord username color roles funded directly via KR balance.<br>
                &nbsp;&nbsp;&nbsp;&nbsp;💰 <code>/vault</code> & <code>/balance</code> — Real-time wallet lookup synchronized across Discord, web dashboard, and Minecraft.<br>
                &nbsp;&nbsp;&nbsp;&nbsp;📋 <code>/updates</code> — Real-time persistent changelog feed pulling directly from the cloud updates engine.<br>
                • <strong>KryloSMP & Elite SMP Cross-Network Grounding:</strong> Synchronized player whitelists, in-game particle trails, and hardened clan intelligence for <em>The Half Life's</em> (st1LLkill3r Leader, Krylo Co-Leader).<br>
                • <strong>Universal Top.gg 2.0x Vote Booster:</strong> Automated 12-hour vote tracking with 2.0x leveling multipliers and live voter shoutouts in <code>#🗳️・𝖵ote-𝖫ogs</code>.</p>
              </div>
            </div>

"""

# Remove LATEST from v5.5
content = re.sub(
    r'<span style="background: #10b981; color: #000; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 8px;">LATEST</span>',
    '',
    content
)

# Insert v5.6 before v5.5
content = content.replace('<div class="stepper">\n            <div class="step-item"', '<div class="stepper">\n' + v56_entry + '            <div class="step-item"')

# 2. Add New Commands to Command Table Body
new_cmd_rows = """              <!-- New Month-End October Commands -->
              <tr class="cmd-row" data-search="/kr-rain !kr-rain economy & rewards trigger a dynamic krims rewards chat drop in active channels (first 10 claimers split pot) /kr-rain [amount]" data-category="Economy & Rewards">
                <td>
                  <span class="cmd-chip" onclick="copyToClipboard('/kr-rain')" title="Click to copy /kr-rain">
                    /kr-rain
                  </span>
                </td>
                <td>
                  <span class="prefix-chip" onclick="copyToClipboard('!kr-rain')" title="Click to copy !kr-rain">
                    !kr-rain
                  </span>
                </td>
                <td>
                  <span class="cat-badge" style="background: rgba(0, 242, 255, 0.1); border: 1px solid rgba(0, 242, 255, 0.3); color: #00f2ff;">
                    <span>💎</span>
                    <span>Economy & Rewards</span>
                  </span>
                </td>
                <td>
                  <div>Trigger a dynamic Krims Rewards chat drop in active channels (first 10 claimers split pot)</div>
                  <span class="syntax-preview">Syntax: /kr-rain [amount]</span>
                </td>
              </tr>
              <tr class="cmd-row" data-search="/imagine !imagine ai & neural generate high-resolution ai artwork powered by the krims neural engine /imagine [prompt]" data-category="AI & Neural">
                <td>
                  <span class="cmd-chip" onclick="copyToClipboard('/imagine')" title="Click to copy /imagine">
                    /imagine
                  </span>
                </td>
                <td>
                  <span class="prefix-chip" onclick="copyToClipboard('!imagine')" title="Click to copy !imagine">
                    !imagine
                  </span>
                </td>
                <td>
                  <span class="cat-badge cat-ai">
                    <span>🎨</span>
                    <span>AI & Neural</span>
                  </span>
                </td>
                <td>
                  <div>Generate high-resolution AI artwork powered by the Krims Neural Engine</div>
                  <span class="syntax-preview">Syntax: /imagine [prompt]</span>
                </td>
              </tr>
              <tr class="cmd-row" data-search="/color !color cosmetics & roles equip custom discord nameplate color roles unlocked via krims rewards balance /color [preset/hex]" data-category="Cosmetics & Roles">
                <td>
                  <span class="cmd-chip" onclick="copyToClipboard('/color')" title="Click to copy /color">
                    /color
                  </span>
                </td>
                <td>
                  <span class="prefix-chip" onclick="copyToClipboard('!color')" title="Click to copy !color">
                    !color
                  </span>
                </td>
                <td>
                  <span class="cat-badge" style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc;">
                    <span>🌈</span>
                    <span>Cosmetics & Roles</span>
                  </span>
                </td>
                <td>
                  <div>Equip custom Discord nameplate color roles unlocked via Krims Rewards balance</div>
                  <span class="syntax-preview">Syntax: /color [preset/hex]</span>
                </td>
              </tr>
              <tr class="cmd-row" data-search="/vault !vault economy & rewards view your real-time krims rewards (kr) vault balance, daily streak, and pass tier /vault" data-category="Economy & Rewards">
                <td>
                  <span class="cmd-chip" onclick="copyToClipboard('/vault')" title="Click to copy /vault">
                    /vault
                  </span>
                </td>
                <td>
                  <span class="prefix-chip" onclick="copyToClipboard('!vault')" title="Click to copy !vault">
                    !vault
                  </span>
                </td>
                <td>
                  <span class="cat-badge" style="background: rgba(0, 242, 255, 0.1); border: 1px solid rgba(0, 242, 255, 0.3); color: #00f2ff;">
                    <span>💰</span>
                    <span>Economy & Rewards</span>
                  </span>
                </td>
                <td>
                  <div>View your real-time Krims Rewards (KR) vault balance, daily streak, and pass tier</div>
                  <span class="syntax-preview">Syntax: /vault</span>
                </td>
              </tr>
              <tr class="cmd-row" data-search="/updates !updates utility & info pull up the latest real-time persistent platform updates and roadmap changelogs /updates" data-category="Utility & Info">
                <td>
                  <span class="cmd-chip" onclick="copyToClipboard('/updates')" title="Click to copy /updates">
                    /updates
                  </span>
                </td>
                <td>
                  <span class="prefix-chip" onclick="copyToClipboard('!updates')" title="Click to copy !updates">
                    !updates
                  </span>
                </td>
                <td>
                  <span class="cat-badge cat-util">
                    <span>📋</span>
                    <span>Utility & Info</span>
                  </span>
                </td>
                <td>
                  <div>Pull up the latest real-time persistent platform updates and roadmap changelogs</div>
                  <span class="syntax-preview">Syntax: /updates</span>
                </td>
              </tr>
"""

content = content.replace('<tbody id="cmdTableBody">\n', '<tbody id="cmdTableBody">\n' + new_cmd_rows)

# Update command counts
content = content.replace("100 Commands Active", "105 Commands Active")
content = content.replace("100-Command Directory", "105-Command Directory")

wiki_path.write_text(content, encoding="utf-8")
print("wiki.html successfully updated with v5.6 Month-End update and new commands!")
