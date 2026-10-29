<div align="center">

# ⚡ Krims Command — Web Dashboard & Fleet Control

**The next-generation operations dashboard, white-label bot launcher, and rewards ecosystem for Discord communities and Minecraft SMP networks.**

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://krims-bot-dashboard.vercel.app)
[![Vite](https://img.shields.io/badge/Built%20with-Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Discord](https://img.shields.io/badge/Discord-Bot%20Fleet-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/sYaVJtXgQb)
[![Top.gg](https://img.shields.io/badge/Top.gg-Verified%20Listing-FF3366?style=for-the-badge&logo=discord)](https://top.gg/discord/servers/899749083532460032)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary%20All%20Rights%20Reserved-00f2ff?style=for-the-badge)](./LICENSE)

[**🌐 Live Dashboard**](https://krims-bot-dashboard.vercel.app) • [**💎 Krims Rewards Hub**](https://krims-bot-dashboard.vercel.app/rewards) • [**🤖 Custom Bot Portal**](https://krims-bot-dashboard.vercel.app/custombot) • [**📖 Documentation & Wiki**](https://krims-bot-dashboard.vercel.app/wiki) • [**💬 Discord Support**](https://discord.gg/sYaVJtXgQb)

---

</div>

## 📌 Overview

**Krims Command Dashboard** is the official web portal for the Krims Discord Bot Fleet and the KryloSMP gaming network. Engineered for high performance, mobile responsiveness, and zero-latency real-time operations, this repository houses both the client application and serverless edge functions powering the community economy.

---

## 🌟 Key Features

### 1. 🎛️ Unified Server Control Room (`/`)
* **Discord OAuth2 Single Sign-On (SSO):** Authenticate with one click to manage owned and administered Discord servers.
* **Visual Message & Component Editor:** Customize server welcome cards, leave banners, and milestone celebrations without writing slash commands.
* **AutoMod Shield:** Configure anti-spam thresholds, phishing filters, mass-mention caps, and auto-quarantine actions visually.
* **Dynamic Theme Switcher:** Real-time client accent engine (Cyber Cyan, Discord Blurple, Royal Violet, Emerald Matrix, Solar Amber, Crimson Rose).

### 2. 💎 Krims Rewards Ecosystem (`/rewards`)
* **1:1 Balance Conversion:** Seamless transition of legacy KryloCoins into **Krims Rewards (KR)**.
* **Interactive Vault:** Authenticated balance lookup, daily streak counters, and VIP pass eligibility simulator.
* **Daily Web Alpha Bonus:** Anti-spam 24-hour bonus claim system (`+250 KR`).
* **Krims Code Premium Passes:**
  * 🌟 **7-Day Premium Pass** (`2,500 KR`) — Instant priority Neural AI reasoning & custom bot slot.
  * 👑 **30-Day Pro Season Pass** (`8,000 KR`) — Unlimited memory context, 3 automated bot slots, and golden Discord nameplate.
  * ⚡ **Enterprise Lifetime Access** (`25,000 KR`) — Permanent lifetime VIP status, custom cape cosmetic, and KSMP whitelist.
* **Direct Discord DM Alerts:** Serverless alert pipeline dispatching release drops straight to Discord inboxes.

### 3. 🤖 White-Label Custom Bot Portal (`/custombot`)
* Deploy branded instances of Krims Command under your community's name and avatar.
* Dedicated token authentication, isolated server configurations, and 0ms response latency.

### 4. 📖 Official Wiki & Command Matrix (`/wiki`)
* Searchable encyclopedia covering all **100 Production Slash Commands**.
* Category filtering for Moderation, Economy, KSMP Bedrock/Java Sync, AI Systems, and Voice Lounges.

---

## 🏗️ Architecture & Tech Stack

```
krims-bot-dashboard/
├── api/                           # Serverless Edge APIs (Vercel Node runtime)
│   ├── interactions.js            # Discord Interactions Endpoint (tweetnacl crypto)
│   ├── rewards.js                 # KR Rewards balance and vault lookups
│   ├── subscribe-dm.js            # Automated Discord DM alert dispatcher
│   ├── custom-bots.js             # Custom bot fleet provisioning engine
│   ├── custom-bot-auth.js         # Token validator for white-label bots
│   ├── bot-guilds.js              # Live bot guild synchronization
│   ├── guild-stats.js             # Telemetry & activity metrics
│   └── guild-channels.js          # Channel layout inspector
├── public/                        # Static assets, vector icons, sound effects
├── src/
│   ├── main.js                    # Core client application & state router
│   └── style.css                  # Hardware-accelerated design system & 60fps animations
├── index.html                     # Main Landing Page & Dashboard Workspace
├── rewards.html                   # Krims Rewards & Vault Hub
├── custombot.html                 # White-Label Custom Bot Builder
├── wiki.html                      # Official Command & Systems Wiki
├── linked-roles.html              # Discord Linked Roles verification gateway
├── privacy.html                   # Official Privacy Policy
├── terms.html                     # Terms of Service
└── vite.config.js                 # Multi-Page Rollup build configuration
```

* **Frontend:** Vanilla JavaScript (ES Modules), HTML5, CSS3 with GPU acceleration (`translate3d`, `contain: paint layout`).
* **Build Tool:** [Vite 8](https://vitejs.dev) with Rollup Multi-Page Application (MPA) bundling.
* **Backend / APIs:** Node.js Serverless Functions deployed on Vercel.
* **Security & Auth:** Discord OAuth2 (Implicit & Code Grant), `tweetnacl` cryptographic signature verification for Discord Interactions.
* **Hosting & CDN:** Vercel Global Edge Network with instant automated GitHub CI/CD.

---

## 🚀 Local Development

### Prerequisites
* [Node.js](https://nodejs.org) (v18.0.0 or later)
* npm or pnpm

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Krylo-60/krims-bot-dashboard.git
   cd krims-bot-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready artifacts will be compiled into the `dist/` directory.

---

## 🔒 Security & Verification

* **Interaction Signature Verification:** All incoming requests from Discord's interaction gateway are verified using public-key Ed25519 signatures via `tweetnacl`.
* **Zero Credential Leaks:** Client credentials, Discord bot tokens, and webhooks are strictly managed via Vercel Environment Variables.

---

## 📜 Legal & Proprietary License

This repository is proprietary software. All rights reserved.

```
Copyright (c) 2026 Krims Code AI & Krylo Studio. All rights reserved.
Made by Krylo and Krims studio • "Dream higher, build higher."
```

Unauthorized copying, cloning, reverse engineering, redistribution, or hosting of this software or any segment thereof is strictly prohibited. For complete terms, see the [LICENSE](./LICENSE) file.

---

<div align="center">
  <sub>Engineered with precision by <strong>Krylo & Krims Code Studio</strong></sub>
</div>
