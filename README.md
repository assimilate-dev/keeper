# Keeper - D&D Combat Assistant

A system-agnostic tabletop RPG assistant focused on streamlining combat while preserving the tactile experience of rolling physical dice.

## Features

- **Initiative Tracking** - Automated turn order with support for PCs, enemies, and lair actions
- **Combat Management** - Round tracking, turn advancement, and combat state
- **Character Management** - HP, AC, conditions, and basic status tracking  
- **Damage/Healing** - Simple damage application and healing with bounds checking
- **Type-Aware Display** - Visual distinction between player characters, enemies, and lair actions

## Quick Start

```javascript
// Create characters
const player = new Character({name: "Gandalf", type: "pc", hp: 38, ac: 15});
const enemy = new Character({name: "Balrog", type: "enemy", hp: 250, ac: 19});
const lair = new Character({name: "Lair Actions", type: "lair"});

// Create combat
const combat = new Combat();

// Add with initiative (rolled at table)
combat.addCharacter(player, 15);  // Player rolled 12 + 3 dex
combat.addCharacter(enemy, 8);    // Enemy rolled 8 + 0 dex  
combat.addCharacter(lair, 20);    // Lair actions always on 20

// Start combat
combat.startCombat();

// Apply damage
enemy.takeDamage(45);

// Track conditions
player.addCondition("Blessed");

// Advance turns
combat.nextTurn();
```

## Project Structure

```
src/models/     - Core data models
examples/       - Usage examples and demos
docs/           - Documentation and architecture notes
```

## Design Philosophy

**Physical Dice First** - Players roll their own dice; system handles the bookkeeping
**System Agnostic** - Built to support D&D 5e now, other systems later
**Start Small** - Minimal viable features that work, then expand
**Preserve Agency** - Automate tedium, not decision-making

## Development Status

This is an active development project. Current focus is on core combat mechanics before expanding to spell tracking, resource management, and campaign-level features.

## Running Examples

```bash
# In browser (open in browser)
examples/basic-usage.js

# In Node.js
node examples/basic-usage.js
```
