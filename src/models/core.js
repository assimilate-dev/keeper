// ============================================================================
// MINIMAL DATA MODELS - D&D Assistant (Start Small)
// ============================================================================

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
      isActive: p.isActive && !p.character.isDown(),
      color: p.character.getDisplayColor()
    }));
  }
}

// Utility function
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Export for Node.js/modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Character, Combat, generateId };
}
