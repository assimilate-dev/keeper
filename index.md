
---
layout: home
title: Combat Speed Agent Roadmap
---

## ✅ Goals
- Automate **turn order** while players roll physical dice.
- Fast **damage/healing** with concentration prompts.
- Track **conditions & spell effects** with durations.
- Quick **spell lookups** + **house-rule adjudication**.
- Generate **flavor snippets** on demand (non-blocking).
- Persist **consumables & spell slots** across combats.
- Maintain **in‑game time** across sessions.

---

## 📅 Two-Week Build Plan (copy/paste into Issues if you prefer)

### Week 1 — Core Engine
- [ ] **Day 1-2:** DB schema (SQLite), `start_encounter`, `set_initiative`, `advance_turn`
- [ ] **Day 3-4:** `apply_damage`, `apply_healing`, temp HP, concentration DC prompts
- [ ] **Day 5:** `add_effect`, `remove_effect`, `tick_effects` at start/end boundaries
- [ ] **Day 6:** `consume_resource`, `restore_resource`, short/long rest helpers
- [ ] **Day 7:** `advance_time`, `end_encounter`, encounter export (JSON/Markdown)

### Week 2 — Knowledge & UX
- [ ] **Day 8:** SRD spell table + `lookup_spell` (local DB first)
- [ ] **Day 9:** `rules_adjudicate` blending SRD + your House Rules
- [ ] **Day 10:** Discord bot surface (slash commands mirror tool calls)
- [ ] **Day 11-12:** Minimal web UI (read-only): initiative list, HP bubbles, effects tray, log
- [ ] **Day 13:** Web UI actions: apply dmg/heal, add/remove effect, advance turn
- [ ] **Day 14:** Stabilize, add flavor snippet library, backups, Release v0.1

> Tip: Open Issues for each task and link PRs. Use `good first issue` labels for quick wins.

---

## 🧠 Architecture & Docs
- [Architecture](/docs/architecture.html)
- [Data Model](/docs/data-model.html)
- [Tool Schemas](/docs/tools-schema.html)
- [Deployment](/docs/deployment.html)

---

## 📌 House Rules (example)
Create a `docs/house-rules.md` with your table rulings (ready/delay timing, invisible reveals, help action, etc.). The agent should always defer to this when `rules_adjudicate` is called.
