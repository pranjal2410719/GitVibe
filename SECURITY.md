# Security Policy

## Reporting a vulnerability

Found a bug with security implications in GitVibe? Please report it privately —
**do not open a public issue** for vulnerabilities.

- Open a [private security advisory](https://github.com/pranjal2410719/GitVibe/security/advisories/new)
- Or email the maintainer (see the repository profile)

We aim to acknowledge reports within 48 hours and ship a fix as soon as possible.

## Scope

This project is a client-side "vibe analyzer" for **public** GitHub data. It stores
no user accounts, no emails, and no private data. Anything you submit (a GitHub
username) is public information.

## Security posture

- **No secrets in the repo.** The optional `GITHUB_TOKEN` is read from the
  environment at runtime only and is never committed. `.env*` files are gitignored.
- **Input validation.** Usernames are validated against GitHub's username rules
  before any network call, preventing injection into upstream URLs.
- **Output escaping.** All GitHub-sourced strings are rendered through React's
  automatic HTML escaping; no raw HTML is ever injected.
- **Security headers.** Every response carries `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
  `Strict-Transport-Security`, and a Content Security Policy (see
  `next.config.ts`).
- **Rate limiting.** The API route applies a per-IP sliding-window limiter
  (in-memory, per serverless instance) to discourage abuse. GitHub's own
  API limits remain the hard cap.
- **No user data persisted.** Recent searches are stored only in the visitor's
  own browser `localStorage`.
- **Dependencies.** Installed via a committed lockfile (`package-lock.json`)
  and reviewed before major bumps.

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| main    | ✅ actively maintained |

## Dependency updates

`npm audit` is run before releases. If you discover a vulnerable transitive
dependency, include it in your report.
