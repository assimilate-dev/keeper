// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

// Import the classes
const { Character, Combat } = require('../src/models/core');

// Create some characters
const player1 = new Character({
  name: "Aragorn",
  type: "pc",
  hp: 58,
  ac: 18
});

const player2 = new Character({
  name: "Legolas", 
  type: "pc",
  hp: 45,
  ac: 16
});

const enemy = new Character({
  name: "Orc Chieftain",
  type: "enemy", 
  hp: 85,
  ac: 15
});

const lairActions = new Character({
  name: "Cave Collapse",
  type: "lair"
});

// Create combat encounter
const combat = new Combat();

// Add characters with their initiative rolls
combat.addCharacter(player1, 17);    // Rolled 14 + 3 dex
combat.addCharacter(player2, 22);    // Rolled 18 + 4 dex  
combat.addCharacter(enemy, 12);      // Rolled 11 + 1 dex
combat.addCharacter(lairActions, 20); // Lair actions on 20

// Start combat
combat.startCombat();

console.log("=== COMBAT STARTED ===");
console.log("Initiative Order:");
combat.getInitiativeOrder().forEach((combatant, index) => {
  const marker = index === combat.currentTurnIndex ? ">>> " : "    ";
  console.log(`${marker}${combatant.initiative}: ${combatant.name} (${combatant.type}) - HP: ${combatant.hp}`);
});

console.log(`\nRound ${combat.currentRound}, ${combat.getCurrentCharacter().name}'s turn`);

// Apply some damage
console.log("\n=== APPLYING DAMAGE ===");
enemy.takeDamage(25);
console.log(`${enemy.name} takes 25 damage! Now at ${enemy.hp.current}/${enemy.hp.max} HP`);

// Add a condition
player1.addCondition("Poisoned");
console.log(`${player1.name} is now ${player1.conditions.join(", ")}`);

// Advance turns
console.log("\n=== ADVANCING TURNS ===");
combat.nextTurn();
console.log(`Now it's ${combat.getCurrentCharacter().name}'s turn`);

combat.nextTurn();
console.log(`Now it's ${combat.getCurrentCharacter().name}'s turn`);

combat.nextTurn();
console.log(`Now it's ${combat.getCurrentCharacter().name}'s turn`);

combat.nextTurn(); // This should start round 2
console.log(`Round ${combat.currentRound}, back to ${combat.getCurrentCharacter().name}'s turn`);
