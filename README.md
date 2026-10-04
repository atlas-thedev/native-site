# Native Site

Marketing + account website for **Native Client** (Next.js 15 App Router, React 19, Tailwind v4, motion, lenis, skinview3d).
Strictly black / white / transparent, dark + light theme.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint         # tsc --noEmit
```

## Environment

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO / sitemap / OG | `https://native.app` (**placeholder – set your real domain**) |
| `NATIVE_API_URL` | Native API for auth + locker | `https://api.nativelaunch.xyz` |
| `NATIVE_SITE_KEY` | Shared secret so the API rate-limits by the visitor IP instead of the site's IP (needs the matching API change, see HANDOFF.md) | unset |
| `GITHUB_TOKEN` | Optional, raises the GitHub API rate limit for releases / change log | unset |
| `NATIVE_REPO` | `owner/repo` that holds launcher releases + commits | `atlas-thedev/native-client` |

## What is where

- `app/` pages: `/`, `/download`, `/changes`, `/support`, `/terms`, `/privacy`, `/login`, `/register`, `/forgot`, `/account`, `/store`
- `app/api/*` route handlers: `auth/[action]` (proxy to Native API, httpOnly cookies), `locker`, `download/[platform]` (302 to latest published release asset), `changes` (paged commits), `status`, `store` (equip / unequip store capes)
- `lib/server/*` server-only data: releases, commits, Mojang versions, session helpers. **The repo URL lives only here – nothing on the site links to GitHub.**
- `components/` UI; `Locker.tsx` + `LockerViewer.tsx` = account skin/cape editor
- `public/art` version artwork, `public/capes` official capes, `public/skins` presets, `public/ui` transparent app screenshots

See **HANDOFF.md** for status and next steps.
