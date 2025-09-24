
---
layout: page
title: Data Model
permalink: /docs/data-model.html
---

```sql
-- Characters
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('pc','npc','lair','legendary')) NOT NULL,
  ac INT, max_hp INT, hp INT, temp_hp INT DEFAULT 0,
  speed INT, resources JSON, notes TEXT
);

-- Encounters
CREATE TABLE encounters (
  id TEXT PRIMARY KEY,
  round INT DEFAULT 1,
  turn_index INT DEFAULT 0,
  time_elapsed_min INT DEFAULT 0,
  initiative_order JSON,  -- array of {id, init, tiebreaker, delayed?}
  log JSON
);

-- Effects
CREATE TABLE effects (
  id TEXT PRIMARY KEY,
  encounter_id TEXT,
  target_id TEXT,
  name TEXT,
  source TEXT,
  concentration BOOLEAN DEFAULT 0,
  ends_on TEXT CHECK (ends_on IN ('start','end','immediate')) DEFAULT 'end',
  remaining_rounds INT, -- NULL = special/indefinite
  notes TEXT
);

-- Campaign Clock
CREATE TABLE campaign_clock (
  id TEXT PRIMARY KEY,
  in_game_date TEXT,
  minutes_elapsed INT DEFAULT 0
);

-- Spells (SRD/homebrew minimal)
CREATE TABLE spells (
  name TEXT PRIMARY KEY,
  level INT, school TEXT, casting_time TEXT,
  range TEXT, components TEXT, duration TEXT,
  text TEXT
);
```
