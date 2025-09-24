
---
layout: page
title: Tool Schemas
permalink: /docs/tools-schema.html
---

Below are JSON Schemas for the agent tools. Copy into your Assistants/Responses API setup.

```json
{
  "name": "start_encounter",
  "parameters": {
    "type":"object",
    "properties":{
      "id":{"type":"string"},
      "combatants":{"type":"array","items":{"type":"object","properties":{
        "id":{"type":"string"},
        "type":{"type":"string","enum":["pc","npc","lair","legendary"]},
        "ac":{"type":"number"},
        "hp":{"type":"number"},
        "max_hp":{"type":"number"},
        "notes":{"type":"string"}
      }, "required":["id","type"]}}
    },
    "required":["id","combatants"]
  }
}
```

```json
{"name":"set_initiative","parameters":{"type":"object","properties":{
  "encounter_id":{"type":"string"},
  "entries":{"type":"array","items":{"type":"object","properties":{
    "id":{"type":"string"},
    "initiative":{"type":"number"},
    "tiebreaker":{"type":"number"}
  },"required":["id","initiative"]}}
},"required":["encounter_id","entries"]}}
```

```json
{"name":"advance_turn","parameters":{"type":"object","properties":{
  "encounter_id":{"type":"string"},
  "auto_tick_effects":{"type":"boolean","default":true}
},"required":["encounter_id"]}}
```

```json
{"name":"apply_damage","parameters":{"type":"object","properties":{
  "encounter_id":{"type":"string"},
  "target_id":{"type":"string"},
  "amount":{"type":"number"},
  "type":{"type":"string"},
  "notes":{"type":"string"}
},"required":["encounter_id","target_id","amount"]}}
```

```json
{"name":"apply_healing","parameters":{"type":"object","properties":{
  "encounter_id":{"type":"string"},
  "target_id":{"type":"string"},
  "amount":{"type":"number"},
  "temp_hp":{"type":"number"}
},"required":["encounter_id","target_id"]}}
```

```json
{"name":"add_effect","parameters":{"type":"object","properties":{
  "encounter_id":{"type":"string"},
  "target_id":{"type":"string"},
  "name":{"type":"string"},
  "duration_rounds":{"type":"number","nullable":true},
  "ends_on":{"type":"string","enum":["start","end","immediate"],"default":"end"},
  "concentration":{"type":"boolean","default":false},
  "source":{"type":"string"}
},"required":["encounter_id","target_id","name"]}}
```

```json
{"name":"remove_effect","parameters":{"type":"object","properties":{
  "encounter_id":{"type":"string"},
  "target_id":{"type":"string"},
  "name":{"type":"string"}
},"required":["encounter_id","target_id","name"]}}
```

```json
{"name":"consume_resource","parameters":{"type":"object","properties":{
  "character_id":{"type":"string"},
  "resource_path":{"type":"string","description":"dot path, e.g., resources.spell_slots.2"},
  "amount":{"type":"number","default":1}
},"required":["character_id","resource_path"]}}
```

```json
{"name":"restore_resource","parameters":{"type":"object","properties":{
  "character_id":{"type":"string"},
  "resource_path":{"type":"string"},
  "amount":{"type":"number","default":1}
},"required":["character_id","resource_path"]}}
```

```json
{"name":"lookup_spell","parameters":{"type":"object","properties":{
  "name":{"type":"string"}
},"required":["name"]}}
```

```json
{"name":"rules_adjudicate","parameters":{"type":"object","properties":{
  "question":{"type":"string"},
  "context":{"type":"string"}
},"required":["question"]}}
```

```json
{"name":"advance_time","parameters":{"type":"object","properties":{
  "minutes":{"type":"number"},
  "reason":{"type":"string"}
},"required":["minutes"]}}
```

```json
{"name":"end_encounter","parameters":{"type":"object","properties":{
  "encounter_id":{"type":"string"}
},"required":["encounter_id"]}}
```
