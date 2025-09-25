// ============================================================================
// BASIC USAGE EXAMPLES - Including Consumables
// ============================================================================

// Import the classes
const { Character, Combat, Consumable, triggerRest, triggerTimeRecovery } = require('../src/models/core');

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

// Create consumables
const actionSurge = new Consumable({
  name: "Action Surge",
  charges: 1,
  resetCondition: "short_rest",
  recoveryType: "full",
  description: "Gain an additional action"
});

const healingPotion = new Consumable({
  name: "Healing Potion",
  charges: 2,
  resetCondition: "never", // Consumable items don't reset
  recoveryType: "full"
});

const spellSlots = new Consumable({
  name: "1st Level Spell Slots",
  charges: { current: 3, max: 4 },
  resetCondition: "long_rest",
  recoveryType: "full"
});

const dawnAbility = new Consumable({
  name: "Blessing of Dawn",
  charges: 1,
  resetCondition: "dawn",
  recoveryType: "full",
  description: "Resets at dawn each day"
});

// Add consumables to characters
player1.addConsumable(actionSurge);
player1.addConsumable(healingPotion);
player1.addConsumable(dawnAbility);
player2.addConsumable(spellSlots);

console.log("=== CONSUMABLES DEMO ===");
console.log(`${player1.name}'s consumables: ${player1.getConsumablesDisplay().join(', ')}`);
console.log(`${player2.name}'s consumables: ${player2.getConsumablesDisplay().join(', ')}`);

// Use some consumables
console.log("\n=== USING CONSUMABLES ===");
console.log(`${player1.name} uses Action Surge: ${player1.useConsumable("Action Surge") ? "Success!" : "Failed!"}`);
console.log(`${player1.name} uses Healing Potion: ${player1.useConsumable("Healing Potion") ? "Success!" : "Failed!"}`);
console.log(`${player1.name} uses Blessing of Dawn: ${player1.useConsumable("Blessing of Dawn") ? "Success!" : "Failed!"}`);
console.log(`${player2.name} casts a spell: ${player2.useConsumable("1st Level Spell Slots") ? "Success!" : "Failed!"}`);

console.log(`\nAfter use:`);
console.log(`${player1.name}'s consumables: ${player1.getConsumablesDisplay().join(', ')}`);
console.log(`${player2.name}'s consumables: ${player2.getConsumablesDisplay().join(', ')}`);

// Create combat encounter
const combat = new Combat();

// Add characters with their initiative rolls
combat.addCharacter(player1, 17);    
combat.addCharacter(player2, 22);    
combat.addCharacter(enemy, 12);      

// Start combat
combat.startCombat();

console.log("\n=== COMBAT STARTED ===");
console.log("Initiative Order:");
combat.getInitiativeOrder().forEach((combatant, index) => {
  const marker = index === combat.currentTurnIndex ? ">>> " : "    ";
  console.log(`${marker}${combatant.initiative}: ${combatant.name} (${combatant.type})`);
  console.log(`    HP: ${combatant.hp} | Conditions: ${combatant.conditions || 'None'}`);
  console.log(`    Consumables: ${combatant.consumables || 'None'}`);
});

// End combat and simulate recovery
combat.endCombat();
console.log("\n=== COMBAT ENDED ===");

// Get all characters for recovery
const allCharacters = [player1, player2];

// Simulate a short rest (only rest-based consumables recover)
console.log("\n=== SHORT REST ===");
triggerRest(allCharacters, "short_rest");
console.log("After short rest (only Action Surge should recover):");
console.log(`${player1.name}'s consumables: ${player1.getConsumablesDisplay().join(', ')}`);
console.log(`${player2.name}'s consumables: ${player2.getConsumablesDisplay().join(', ')}`);

// Use Action Surge again to show it recovered
console.log(`\n${player1.name} uses Action Surge again: ${player1.useConsumable("Action Surge") ? "Success!" : "Failed!"}`);

// Simulate time passing to dawn (only time-based consumables recover)
console.log("\n=== DAWN ARRIVES ===");
triggerTimeRecovery(allCharacters, "dawn");
console.log("After dawn (only Blessing of Dawn should recover):");
console.log(`${player1.name}'s consumables: ${player1.getConsumablesDisplay().join(', ')}`);
console.log(`${player2.name}'s consumables: ${player2.getConsumablesDisplay().join(', ')}`);

// Simulate a long rest (rest-based consumables recover again)
console.log("\n=== LONG REST ===");
triggerRest(allCharacters, "long_rest");
console.log("After long rest (spell slots and Action Surge recover):");
console.log(`${player1.name}'s consumables: ${player1.getConsumablesDisplay().join(', ')}`);
console.log(`${player2.name}'s consumables: ${player2.getConsumablesDisplay().join(', ')}`);
