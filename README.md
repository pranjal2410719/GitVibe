# GitVibes — Developer Personality Lab 🔮

Type any public GitHub username and get a playful personality breakdown powered by live GitHub data:

- **Personality analysis** — a seeded-but-data-driven archetype, signature traits, and a fun fact
- **Custom scores** — Aura, Chaos, and Energy with tiered labels and radial gauges
- **Recruiter-style impressions** — data-aware notes, a verdict, and a hire score
- **Repo highlights** — top starred repos, language & skill charts
- **Contribution activity** — GitHub-style heatmap (via the community contributions API) plus a recent-activity feed and commit-hour insight
- **The roast** 🔥 — conditionally generated, always optional in spirit
- **Shareable developer identity card** — rendered at a fixed width and downloadable as a crisp PNG (fonts and avatar embedded via `modern-screenshot`)
- Recent searches, shareable `?u=username` links, loading states, and friendly error handling

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first config)
- [modern-screenshot](https://github.com/xyhxx/modern-screenshot) for card export
- [lucide-react](https://lucide.dev) icons
- Server-side proxy route (`/api/profile/[username]`) with in-memory caching and deduplication

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable         | Purpose                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`   | Optional. A classic PAT (no scopes needed) raises the GitHub API limit from 60 to 5,000 requests/hour.   |

Without a token, the app works fine for light use (GitHub's unauthenticated limit is 60 req/hr per IP, and responses are cached server-side for 10 minutes).

## Data sources

- GitHub REST API (`api.github.com`) — profile, repos, public events
- [github-contributions-api](https://github-contributions-api.jogruber.de) — contribution calendar (best-effort; if it's unavailable the app still works, just skips the heatmap)

## Deploy (Netlify, Git-based)

Netlify auto-detects Next.js and handles the build and publish directory — the only
setting in `netlify.toml` is the build command.

1. Push this repo to GitHub (or GitLab / Bitbucket):

   ```bash
   git add .
   git commit -m "Build GitVibes"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. In the [Netlify dashboard](https://app.netlify.com), choose **Add new site → Import an existing project**,
   pick the repo, and deploy. No build settings to change — Node version is pinned via `.nvmrc` (22).

3. (Recommended) Add a `GITHUB_TOKEN` environment variable under **Site settings → Environment variables**
   to raise the GitHub API limit from 60 to 5,000 requests/hour.

4. Deploys now happen automatically on every push to `main`.

## Notes

- The personality output is deterministic per username but varies across users, combining real stats with seeded selection.
- Vibe analysis is 100% real and 0% official. Not affiliated with GitHub.
