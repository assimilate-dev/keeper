
---
layout: page
title: Deployment
permalink: /docs/deployment.html
---

## GitHub Pages (this site)
- Push this repo to GitHub.
- Settings → Pages → Source: `Deploy from a branch`, select `main`, folder `/ (root)`.
- Optional: add a custom domain by creating a `CNAME` file at the repo root.

## Backend (FastAPI)
- Start local: `uvicorn app:app --reload --port 8123`
- Host later: Render, Fly.io, Railway, or a tiny VPS.
- Add `.env` for API keys; never commit secrets.

## Database
- Start with **SQLite** file (easy backups).
- Migrate to **Postgres/Supabase** when you want multi-user or web UI.

## Discord Bot (optional quick UX)
- Mirror each tool as a slash command: `/apply_damage`, `/advance_turn`, etc.
- Responses summarize what changed and show whose turn is next.

## Web UI
- Start read-only (initiative, HP/conditions, log).
- Then add buttons for damage/heal/effects and a big **Advance Turn**.
- Keep mechanics snappy; flavor generation should never block actions.
