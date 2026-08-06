# 🧬 GitVibe — Developer Personality Lab

> **Turn public commits into custom personality profiles.**
> Check your developer aura, track language vibes, and get roasted by your own code activity.

Type any **public GitHub username** and GitVibe builds a playful-but-useful personality
breakdown from **live GitHub data** — a shareable developer identity card included.

![Stack](https://img.shields.io/badge/Next.js_16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind_v4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

| Feature | What you get |
| --- | --- |
| 🔮 **Personality analysis** | A data-driven archetype (12 total, e.g. *The Midnight Hacker*, *The OSS Soul*), signature traits, and a fun fact — deterministic per user, varied across users |
| 🌡️ **Custom scores** | **Aura**, **Chaos**, and **Energy** gauges with tiered labels (`Radiant`, `Chaotic`, `Supernova`…) |
| 💼 **Recruiter-style impressions** | Data-aware notes, a verdict, and a 0–100 **hire score** |
| 🗂️ **Repo highlights** | Top starred repos with stars, forks, and language dots |
| 🎨 **Language & skills** | Language-share bars plus detected skill domains |
| 🟩 **Contribution heatmap** | GitHub-style activity grid with streak stats |
| 📡 **Recent activity** | Public-event feed + peak commit-hour insight (night-owl detector) |
| 🔥 **The roast** | Conditional + generic roasts, "100% certified, 0% accurate" |
| 🪪 **Identity card** | Fixed-1080px design card exported as a crisp PNG (fonts & avatar embedded) |
| 🕒 **Recents** | Recent searches in `localStorage`, shareable `?u=username` links |

## 🧱 Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first config) with a custom dark theme
- **Icons:** [lucide-react](https://lucide.dev)
- **Card export:** [modern-screenshot](https://github.com/xyhxx/modern-screenshot)
- **Data sources:** GitHub REST API + [github-contributions-api](https://github-contributions-api.jogruber.de)

## 🏗️ Architecture

```
┌─────────────────────┐   GET /api/profile/:username    ┌──────────────────────────┐
│  Browser (Next.js)  │ ──────────────────────────────► │  Server route (proxy)    │
│  · search + recents │                                 │  · GitHub REST API       │
│  · analysis UI      │  JSON: { raw, stats, personality }│  · contributions API     │
│  · PNG card export  │ ◄────────────────────────────── │  · in-memory cache/limit │
└─────────────────────┘                                 └──────────────────────────┘
```

**Data flow**

1. The client calls a single server route, `GET /api/profile/:username`.
2. The route fetches **user**, **repos** (up to 100), **public events** (30), and the
   **contribution calendar** in parallel. The profile is required; the other three
   legs degrade gracefully if a source hiccups.
3. `stats.ts` derives metrics (stars, streaks, night-owl ratio, language entropy, skills…).
4. `personality.ts` combines those stats with a **seeded random generator** (keyed by
   username) to pick archetypes, scores, traits, roasts, and the recruiter report —
   deterministic per user, never repetitive across users.
5. Results are cached in memory for 10 minutes (complete results only) with
   in-flight deduplication.

**Key folders**

```
src/
├── app/
│   ├── api/profile/[username]/route.ts   # GitHub proxy + cache + rate limit
│   ├── layout.tsx                        # fonts, metadata, security headers source
│   └── page.tsx                          # renders the app (client component)
├── components/                           # UI: search, sections, heatmap, identity card…
└── lib/
    ├── types.ts                          # shared types (GitHub API + analysis)
    ├── stats.ts                          # data → metrics
    ├── personality.ts                    # metrics + seeded RNG → personality
    ├── language-colors.ts                # GitHub language → color map
    ├── seeded-random.ts                  # deterministic PRNG helpers
    └── format.ts                         # number/date formatting helpers
```

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build (runs TypeScript checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint over `src/` |

## 🔐 Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | No | A classic PAT (no scopes needed) raises the GitHub API limit from **60 → 5,000 requests/hour**. Never commit it — it is read from the environment at runtime. |

Without a token the app works fine for light use (GitHub's unauthenticated limit is
60 req/hr per IP, plus the app caches results for 10 minutes and rate-limits
per client IP).

## 📡 API

### `GET /api/profile/:username`

Returns a `ProfileResult`:

```jsonc
{
  "username": "torvalds",
  "raw": { "user": {}, "repos": [], "events": [], "contributions": {} },
  "stats": { "stars": 254849, "followers": 315206, /* ... */ },
  "personality": {
    "archetype": { "title": "The Perfectionist", /* ... */ },
    "scores": { "aura": {}, "chaos": {}, "energy": {} },
    "traits": [],
    "recruiting": { "verdict": "Hire immediately", "hireScore": 83 },
    "roasts": [],
    "funFact": "",
    "powerLevel": {}
  },
  "meta": { "fromCache": false, "partial": false, "fetchedAt": 0 }
}
```

**Status codes**

| Code | Meaning |
| --- | --- |
| `200` | Profile analyzed (may include `meta.partial: true` if contribution data was unavailable) |
| `400` | Invalid GitHub username format |
| `404` | User does not exist |
| `429` | Rate limited (GitHub API limit or our per-IP limiter) |
| `502` | Upstream (GitHub) unreachable |

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for the full policy. Highlights:

- Input validation, output escaping (React), no secrets in the repo, `.env*` gitignored
- Security headers + CSP on every response (see `next.config.ts`)
- Per-IP rate limiting on the API route
- No user data stored server-side — recents live only in the visitor's `localStorage`

## 🚢 Deployment

The repo is configured for **Netlify** (Git-based continuous deployment).

1. Push to GitHub — the repo already contains `netlify.toml` (build command) and
   `.nvmrc` (Node 22). Netlify auto-detects Next.js, applies its build plugin, and
   handles the publish directory — **no build settings to change**.
2. In the [Netlify dashboard](https://app.netlify.com): **Add new site →
   Import an existing project** → pick this repo → **Deploy**.
3. Optional but recommended: add a `GITHUB_TOKEN` under **Site settings →
   Environment variables** to raise the GitHub API limit.
4. Every push to `main` auto-deploys.

## 📜 License

[MIT](./LICENSE) © 2026 [Pranjal Yadav](https://github.com/pranjal2410719)

---

*GitVibe is a fan-made experiment. Not affiliated with GitHub — and vibe analysis
is not career advice. 100% real, 0% official.*
