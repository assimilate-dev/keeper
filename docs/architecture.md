
---
layout: page
title: Architecture
permalink: /docs/architecture.html
---

## High-Level
- **LLM Orchestration:** OpenAI Assistants/Responses API (tool-calling).
- **Service:** FastAPI (Python) exposing small HTTP endpoints for each tool.
- **State Store:** SQLite (dev) → Postgres/Supabase (later).
- **Retrieval:** Start with a local `spells` SQL table; expand to embeddings if desired.
- **Surfaces:** Discord bot (fast), Web UI (React) for table display & quick actions.

## Flow
1. User message → LLM → decides to call a tool (e.g., `apply_damage`).
2. FastAPI endpoint updates DB, returns new state.
3. LLM summarizes the outcome and next prompt (“Alice’s turn; Haste ends at turn end.”).
4. Web/Discord UI subscribes to changes and renders the encounter state.

## Guardrails
- “Spoilers-off”: never reveal hidden DCs or HP totals unless DM requests.
- Concentration auto-enforced: applying a new concentration effect drops prior.
- Turn boundaries: effects may end on **start** or **end** of target’s turn.
