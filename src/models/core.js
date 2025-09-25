// ============================================================================
// MINIMAL DATA MODELS - D&D Assistant (Start Small)
// ============================================================================

// Consumable - represents abilities, items, spell slots, etc. that get expended
class Consumable {
  constructor(data) {
    this.id = data.id || generateId();
    this.name = data.name;
    this.charges = {
      current: data.charges?.current || data.charges || 1,
      max: data.charges?.max || data.charges || 1
    };
    
    // Reset conditions: 'long_rest', 'short_rest', 'dawn', 'dusk', 'never'
    this.resetCondition = data.resetCondition || 'long_rest';
    this.resetType = this.getResetType(this.resetCondition); // 'rest' or 'time'
    
    // How charges recover: 'full', 'dice', or a specific number
    this.recoveryType = data.recoveryType || 'full';
    this.recoveryAmount = data.recoveryAmount; // For dice rolls or fixed amounts
    
    this.description = data.description || '';
    this.notes = data.notes || '';
  }
  
  // Use charges
  use(amount = 1) {
    if (this.charges.current >= amount) {
      this.charges.current -= amount;
      return true;
    }
    return false; // Not enough charges
  }
  
  // Check if can be used
  canUse(amount = 1) {
    return this.charges.current >= amount;
  }
  
  // Restore charges based on recovery type
  recover() {
    switch (this.recoveryType) {
      case 'full':
        this.charges.current = this.charges.max;
        break;
      case 'dice':
        // This would need dice rolling implementation
        // For now, just recover half (placeholder)
        const recovered = Math.ceil(this.charges.max / 2);
        this.charges.current = Math.min(this.charges.max, this.charges.current + recovered);
        break;
      default:
        // If it's a number, recover that amount
        if (typeof this.recoveryType === 'number') {
          this.charges.current = Math.min(this.charges.max, this.charges.current + this.recoveryType);
        }
        break;
    }
  }
  
  // Get display string
  getDisplayString() {
    return `${this.name} (${this.charges.current}/${this.charges.max})`;
  }
  
  // Determine if this is rest-based or time-based recovery
  getResetType(condition) {
    const restBased = ['long_rest', 'short_rest'];
    const timeBased = ['dawn', 'dusk'];
    
    if (restBased.includes(condition)) return 'rest';
    if (timeBased.includes(condition)) return 'time';
    return 'never';
  }
}

// Simple Character - just what we need for basic combat
class Character {
  constructor(data) {
    this.id = data.id || generateId();
    this.name = data.name;
    this.type = data.type || 'pc';         // 'pc', 'enemy', or 'lair'
    
    // Just the basics for D&D 5e
    this.ac = data.ac || 10;               // Armor Class
    this.hp = {
      current: data.hp?.current || data.hp || 1,
      max: data.hp?.max || data.hp || 1
    };
    
    // Lair actions don't need HP/AC
    if (this.type === 'lair') {
      this.hp = null;
      this.ac = null;
    }
    
    // Simple status tracking
    this.conditions = [];                   // Array of condition names
    this.consumables = [];                  // Array of Consumable objects
    this.notes = data.notes || '';
  }
  
  // Take damage
  takeDamage(amount) {
    if (this.type === 'lair' || !this.hp) return; // Lair actions can't take damage
    this.hp.current = Math.max(0, this.hp.current - amount);
  }
  
  // Heal
  heal(amount) {
    if (this.type === 'lair' || !this.hp) return; // Lair actions can't be healed
    this.hp.current = Math.min(this.hp.max, this.hp.current + amount);
  }
  
  // Add condition
  addCondition(condition) {
    if (!this.conditions.includes(condition)) {
      this.conditions.push(condition);
    }
  }
  
  // Remove condition  
  removeCondition(condition) {
    this.conditions = this.conditions.filter(c => c !== condition);
  }
  
  // Add consumable
  addConsumable(consumable) {
    this.consumables.push(consumable);
  }
  
  // Remove consumable
  removeConsumable(consumableId) {
    this.consumables = this.consumables.filter(c => c.id !== consumableId);
  }
  
  // Find consumable by name or ID
  getConsumable(identifier) {
    return this.consumables.find(c => c.id === identifier || c.name === identifier);
  }
  
  // Use a consumable
  useConsumable(identifier, amount = 1) {
    const consumable = this.getConsumable(identifier);
    return consumable ? consumable.use(amount) : false;
  }
  
  // Trigger rest recovery for consumables
  rest(restType) {
    this.consumables.forEach(consumable => {
      if (consumable.resetType === 'rest' && consumable.resetCondition === restType) {
        consumable.recover();
      }
    });
  }
  
  // Trigger time-based recovery for consumables
  timeRecovery(timeCondition) {
    this.consumables.forEach(consumable => {
      if (consumable.resetType === 'time' && consumable.resetCondition === timeCondition) {
        consumable.recover();
      }
    });
  }
  
  // Get all consumables for display
  getConsumablesDisplay() {
    return this.consumables.map(c => c.getDisplayString());
  }
  
  // Is character unconscious/dead?
  isDown() {
    if (this.type === 'lair') return false; // Lair actions are never "down"
    return this.hp && this.hp.current <= 0;
  }
  
  // Get display color based on type
  getDisplayColor() {
    switch (this.type) {
      case 'pc': return '#4CAF50';      // Green for players
      case 'enemy': return '#F44336';   // Red for enemies  
      case 'lair': return '#FF9800';    // Orange for lair actions
      default: return '#757575';        // Gray for unknown
    }
  }
}

// Simple Combat Tracker
class Combat {
  constructor() {
    this.id = generateId();
    this.participants = [];                // Array of characters
    this.currentRound = 0;
    this.currentTurnIndex = 0;
    this.isActive = false;
  }
  
  // Add character to combat
  addCharacter(character, initiative) {
    const combatant = {
      character: character,
      initiative: initiative,
      isActive: true
    };
    
    this.participants.push(combatant);
    this.sortByInitiative();
  }
  
  // Remove character from combat
  removeCharacter(characterId) {
    this.participants = this.participants.filter(p => p.character.id !== characterId);
  }
  
  // Sort participants by initiative (highest first)
  sortByInitiative() {
    this.participants.sort((a, b) => b.initiative - a.initiative);
  }
  
  // Start combat
  startCombat() {
    if (this.participants.length === 0) return false;
    
    this.isActive = true;
    this.currentRound = 1;
    this.currentTurnIndex = 0;
    return true;
  }
  
  // Get current character
  getCurrentCharacter() {
    if (!this.isActive || this.participants.length === 0) return null;
    return this.participants[this.currentTurnIndex]?.character;
  }
  
  // Go to next turn
  nextTurn() {
    if (!this.isActive) return;
    
    this.currentTurnIndex++;
    
    // If we've gone through everyone, start new round
    if (this.currentTurnIndex >= this.participants.length) {
      this.nextRound();
    }
  }
  
  // Start new round
  nextRound() {
    this.currentRound++;
    this.currentTurnIndex = 0;
  }
  
  // End combat
  endCombat() {
    this.isActive = false;
  }
  
  // Get initiative order for display
  getInitiativeOrder() {
    return this.participants.map(p => ({
      name: p.character.name,
      type: p.character.type,
      initiative: p.initiative,
      hp: p.character.hp ? `${p.character.hp.current}/${p.character.hp.max}` : 'N/A',
      conditions: p.character.conditions.join(', '),
      consumables: p.character.getConsumablesDisplay().join(', '),
      isActive: p.isActive && !p.character.isDown(),
      color: p.character.getDisplayColor()
    }));
  }
  

}

// Utility function
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Global rest and recovery functions
function triggerRest(characters, restType) {
  characters.forEach(character => {
    character.rest(restType);
  });
}

function triggerTimeRecovery(characters, timeCondition) {
  characters.forEach(character => {
    character.timeRecovery(timeCondition);
  });
}

// Export for Node.js/modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Character, Combat, Consumable, generateId, triggerRest, triggerTimeRecovery };
}
