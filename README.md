<div align="center">

# 🎬 Cinevo

### **Next-Generation Cinematic Discovery, Multi-Source Streaming & 24/7 Live IPTV Engine**

<p align="center">
  <a href="https://github.com/jaskaran331/cinevo/stargazers"><img src="https://img.shields.io/github/stars/jaskaran331/cinevo?style=for-the-badge&color=a3e635&logo=star" alt="Stars" /></a>
  <a href="https://github.com/jaskaran331/cinevo/network/members"><img src="https://img.shields.io/github/forks/jaskaran331/cinevo?style=for-the-badge&color=84cc16&logo=git" alt="Forks" /></a>
  <a href="https://github.com/jaskaran331/cinevo/issues"><img src="https://img.shields.io/github/issues/jaskaran331/cinevo?style=for-the-badge&color=lime" alt="Issues" /></a>
  <a href="https://github.com/jaskaran331/cinevo/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://schema.org/"><img src="https://img.shields.io/badge/SEO-Schema.org%20JSON--LD-0055ff?style=for-the-badge&logo=google" alt="SEO" /></a>
</p>

<p align="center">
  <b>Cinevo</b> is an ultra-fast, zero-dependency OTT discovery portal and high-definition media player. Featuring an electric lime-green OLED design system, real-time HiAnime release catalog synchronization, automated player HUD auto-hiding, multi-season routing, and 1,170+ global Live TV channels.
</p>

[✨ Key Features](#-features) • [⚡ Quick Start](#-quick-start) • [🏛️ Architecture](#-system-architecture) • [📡 Streaming Engine](#-multi-provider-streaming-resilience) • [🔍 SEO & AI Discovery](#-seo--ai-search-dominance) • [🧪 Testing](#-test--diagnostics)

---

</div>

## 📸 Visual Showcase

<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <b>Electric Lime Cinematic Discovery</b><br/>
        <img src="assets/screenshots/cinevo_home_lime.png" alt="Cinevo Home Screen" width="100%" />
      </td>
      <td width="50%" align="center">
        <b>HiAnime Sync & Season Routing</b><br/>
        <img src="assets/screenshots/cinevo_watch_anime.png" alt="Anime Watch Stage" width="100%" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <b>Compact Fast-Jump Season & Episode HUD</b><br/>
        <img src="assets/screenshots/cinevo_season_dropdown.png" alt="Compact Season Dropdown" width="100%" />
      </td>
      <td width="50%" align="center">
        <b>24/7 Global IPTV Player with Idle HUD Fade</b><br/>
        <img src="assets/screenshots/cinevo_livetv.png" alt="Live TV Player" width="100%" />
      </td>
    </tr>
  </table>
</div>

---

## 🌟 Features

### ⚡ Electric Lime-Green OLED Aesthetic
- **Signature Visual Identity**: Tailored `#a3e635` / `#84cc16` neon-lime accents set against deep `#06070a` and `#0b0e14` obsidian glass.
- **Glassmorphic Controls**: Backdrop blur filtering (`backdrop-filter: blur(16px)`), luminous border gradients, and responsive micro-interactions.
- **Adaptive Mobile Layout**: 100% responsive on mobile browsers, tablets, desktop monitors, and Smart TVs.

### 🍙 HiAnime Release Catalog Sync & Season Routing
- **Latest Simulcasts Prioritized**: Prioritizes latest seasons and airing episodes over legacy archives (e.g. Solo Leveling Season 2, Bleach TYBW, DanMachi Season 5).
- **AniList & TMDB Multi-Season Parsing**: Maps anime franchises into clean separate seasons and movies with accurate episode counts, eliminating phantom placeholders.
- **Dual Title Localization**: Simultaneous display of Romaji, English, and native Japanese titles with studio credits and status badges.

### 🎛️ Compact Precision Episode & Season Selector
- **Compact HUD**: Streamlined, space-saving selector bars replace cluttered full-page grids.
- **Fast-Jump Navigation**: Direct episode jump inputs (`Go to: [ Ep # ]`) and paginated multi-decade tabs (`1–50`, `51–100`, `101–150+`).
- **Uncapped Episode Depth**: Native support for long-running series with 1,000+ episodes (One Piece, Detective Conan, Naruto Shippuden).

### 📺 24/7 Global Live TV & Sports Streaming
- **1,170+ Channels**: Verified live channels spanning Sports, News, Cinema, Documentary, and International broadcasts.
- **Auto-Hiding Controls**: Player overlay controls and channel bars automatically fade after 2.5 seconds of user inactivity and instantly reappear upon mouse, touch, or key movement.
- **Native iOS & Fullscreen Resilience**: Dual-path engine supporting both native Apple AVPlayer fullscreen (`webkitEnterFullscreen`) and high-z-index pseudo-fullscreen.

### 🌐 High-Uptime Multi-Provider Fallback Engine
- Rotating failover architecture across **VidLink Pro**, **VidStuck**, **ZXCStream**, **Bingr**, **Nxsha**, **Flix Vumeto**, and **TGVid Fast**.
- Seamless fallback selection without restarting playback or losing timestamp context.

---

## ⚡ Quick Start

Cinevo is engineered to be **100% self-contained**. You can clone and run it instantly with zero `npm install` steps required.

### 1. Clone the Repository
```bash
git clone https://github.com/jaskaran331/cinevo.git
cd cinevo
```

### 2. Launch the Development Server
```bash
node serve.js
```

### 3. Open in Browser
Navigate to **`http://localhost:3000`** in your browser.

> [!TIP]
> Cinevo runs on standard Node.js (v18+) without requiring external package installations. All server routing, reverse proxy caching, and MIME handling are handled directly by `serve.js`.

---

## 🏛️ System Architecture

```mermaid
graph TD
    User([🌐 User Client / Smart TV / Mobile])
    
    subgraph Cinevo Core [Cinevo Frontend & Reverse Proxy Engine]
        Proxy[node serve.js Server<br/>HTTP Proxy, Static Host & Caching]
        SPA[React 19 Standalone Single Page App<br/>Tailwind CSS + Glassmorphism UI]
        SEO[Structured Data Engine<br/>Schema.org JSON-LD + Semantic Fallbacks]
    end
    
    subgraph Discovery APIs [Upstream Metadata & Channel Feeds]
        TMDB[The Movie Database API<br/>Movies & Series Metadata]
        AniList[AniList GraphQL API<br/>Real-Time Anime Simulcasts]
        Jikan[Jikan / MyAnimeList<br/>Anime Fallback Mapping]
        IPTV[Lovable IPTV Directory<br/>1,170+ Live TV Channels]
    end

    subgraph Streaming Providers [Multi-Source Player Resolvers]
        P1[VidLink Pro]
        P2[VidStuck]
        P3[ZXCStream]
        P4[Bingr]
        P5[Nxsha]
        P6[Flix Vumeto]
        P7[TGVid Fast]
    end

    User -->|HTTP / HTTPS| Proxy
    Proxy --> SPA
    Proxy --> SEO
    SPA -->|Search & Discovery| TMDB
    SPA -->|Latest Airing Catalogs| AniList
    SPA -->|Anime Fallback| Jikan
    SPA -->|Channel Streams| IPTV
    SPA -->|Dynamic Embed Resolution| P1 & P2 & P3 & P4 & P5 & P6 & P7
```

---

## 📡 Multi-Provider Streaming Resilience

| Provider | Supported Formats | Primary Media Types | Autoplay Support | Failover Rank |
|---|---|---|---|---|
| **VidLink Pro** | HLS / Dash / MP4 | Movies, TV Series, Anime | ✅ Yes | Tier 1 (Primary) |
| **VidStuck** | HLS / MP4 | Movies & TV Series | ✅ Yes | Tier 2 |
| **ZXCStream** | HLS Embed | TV Shows & Movies | ✅ Yes | Tier 3 |
| **Bingr** | Adaptive Stream | Global Releases | ✅ Yes | Tier 4 |
| **Nxsha** | Cloud Stream | International TV | ⚠️ Manual | Tier 5 |
| **Flix Vumeto** | Fast Embed | Hollywood & Global | ✅ Yes | Tier 6 |
| **TGVid Fast** | Direct Stream | Direct Files & Specials | ✅ Yes | Tier 7 |

---

## 🔍 SEO & AI Search Dominance

Cinevo is meticulously optimized to achieve top search ranking on **Google**, **Bing**, **Yandex**, **Baidu**, and AI answer engines (**Perplexity**, **ChatGPT Search**, **Claude**, **Gemini**):

- **Structured Data (Schema.org JSON-LD)**: Injected `WebSite` specification with `SearchAction` enabling Google Sitelinks Search Box directly from the search results page, paired with an aggregate 4.9 rating `WebApplication` entity.
- **Universal Crawler Directives (`robots.txt`)**: Explicit crawl directives tailored for `Googlebot`, `Googlebot-Image`, `Googlebot-Video`, `Bingbot`, `Applebot`, `Baiduspider`, `YandexBot`, `PerplexityBot`, `GPTBot`, and `ClaudeBot`.
- **Automated XML Sitemap (`sitemap.xml`)**: Live index of primary application roots, categories (`/movies`, `/series`, `/anime`, `/live`), with change frequencies and priority ratings.
- **PWA Webmanifest (`site.webmanifest`)**: Cross-platform progressive web application declaration for mobile home-screen installation and app store crawling.
- **Semantic Crawler `<noscript>` Fallback**: Comprehensive HTML outline rendering keyword-rich semantic headings, descriptions, and category links for search indexing engines that do not execute complex JavaScript.

---

## 🧪 Test & Diagnostics

Cinevo includes an integrated diagnostic verification suite validating all upstream endpoints, parsers, and build syntaxes:

```bash
node test.js
```

### Verification Coverage:
- ✅ **TMDB Discovery**: Verifies upstream API key connectivity and trending movie feeds.
- ✅ **Live TV Backend**: Confirms availability of all 1,170+ IPTV stream feeds.
- ✅ **AniList GraphQL**: Validates query resolution for real-time anime catalogs.
- ✅ **Standalone Build Integrity**: Tests bundle byte size and absence of raw code leaks.
- ✅ **JavaScript Virtual Machine Syntax**: Runs VM compilation checks on production scripts.
- ✅ **Season Selector Components**: Validates markup existence for compact season selectors.
- ✅ **Route Parser Unit Tests**: Tests pattern matching across movie, series, and anime paths.

---

## 📁 Repository Structure

```
cinevo/
├── assets/
│   └── screenshots/              # High-resolution application screenshots
│       ├── cinevo_home_lime.png
│       ├── cinevo_watch_anime.png
│       ├── cinevo_season_dropdown.png
│       └── cinevo_livetv.png
├── src/
│   ├── config/
│   │   └── constants.js          # API keys, routes & upstream configurations
│   └── services/
│       ├── downloads.js          # Telegram direct file download resolvers
│       ├── livetv.js             # IPTV stream loader & channel categories
│       ├── player.js             # Embed resolver & multi-provider fallback logic
│       └── tmdb.js               # Movie & Series discovery API client
├── index.html                    # Unified React 19 SPA + SEO Structured Data
├── package.json                  # Project manifest and execution scripts
├── robots.txt                    # Search crawler & AI engine directives
├── serve.js                      # High-performance Node.js static & proxy server
├── site.webmanifest              # Progressive Web App (PWA) manifest
├── sitemap.xml                   # Search engine XML sitemap
└── test.js                       # Comprehensive automated testing suite
```

---

## 🛡️ License & Disclaimer

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

*Disclaimer: Cinevo is an educational open-source software project that aggregates publicly accessible third-party APIs and streaming embeds. Cinevo does not host, store, or upload copyrighted video media files to its servers.*

<div align="center">
  <b>Built with precision for film lovers, anime enthusiasts, and sports fans worldwide.</b><br/>
  <sub>⭐ If you find Cinevo useful, consider starring the repository! ⭐</sub>
</div>
