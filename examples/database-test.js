// ============================================================================
// DATABASE TEST - Test persistence with SQLite
// ============================================================================

const database = require('../src/database/setup');
const repository = require('../src/database/repository');
const { Character, Combat, Consumable } = require('../src/models/core');

async function testDatabase() {
  try {
    console.log('=== SETTING UP DATABASE ===');
    await database.setup();
    
    console.log('\n=== CREATING TEST CHARACTERS ===');
    
    // Create test characters
    const gandalf = new Character({
      name: "Gandalf",
      type: "pc",
      hp: 38,
      ac: 15
    });
    
    const legolas = new Character({
      name: "Legolas", 
      type: "pc",
      hp: 45,
      ac: 16
    });
    
    // Add consumables
    gandalf.addConsumable(new Consumable({
      name: "Spell Slots",
      charges: 3,
      resetCondition: "long_rest"
    }));
    
    gandalf.addConsumable(new Consumable({
      name: "Staff Charges",
      charges: 10,
      resetCondition: "dawn"
    }));
    
    legolas.addConsumable(new Consumable({
      name: "Hunter's Mark",
      charges: 1,
      resetCondition: "long_rest"
    }));
    
    // Add some conditions
    gandalf.addCondition("Blessed");
    legolas.addCondition("Hunter's Mark");
    
    console.log(`Created ${gandalf.name} with ${gandalf.consumables.length} consumables`);
    console.log(`Created ${legolas.name} with ${legolas.consumables.length} consumables`);
    
    console.log('\n=== SAVING TO DATABASE ===');
    await repository.saveCharacter(gandalf);
    await repository.saveCharacter(legolas);
    console.log('Characters saved successfully');
    
    console.log('\n=== LOADING FROM DATABASE ===');
    const loadedGandalf = await repository.loadCharacter(gandalf.id);
    const loadedLegolas = await repository.loadCharacter(legolas.id);
    
    console.log(`Loaded ${loadedGandalf.name}: HP ${loadedGandalf.hp.current}/${loadedGandalf.hp.max}, AC ${loadedGandalf.ac}`);
    console.log(`  Conditions: ${loadedGandalf.conditions.join(', ')}`);
    console.log(`  Consumables: ${loadedGandalf.getConsumablesDisplay().join(', ')}`);
    
    console.log(`Loaded ${loadedLegolas.name}: HP ${loadedLegolas.hp.current}/${loadedLegolas.hp.max}, AC ${loadedLegolas.ac}`);
    console.log(`  Conditions: ${loadedLegolas.conditions.join(', ')}`);
    console.log(`  Consumables: ${loadedLegolas.getConsumablesDisplay().join(', ')}`);
    
    console.log('\n=== TESTING COMBAT PERSISTENCE ===');
    
    // Create combat
    const combat = new Combat();
    combat.addCharacter(loadedGandalf, 15);
    combat.addCharacter(loadedLegolas, 18);
    combat.startCombat();
    
    console.log(`Created combat with ${combat.participants.length} participants`);
    
    // Save combat
    await repository.saveCombat(combat);
    console.log('Combat saved successfully');
    
    // Load combat
    const loadedCombat = await repository.loadCombat(combat.id);
    console.log(`Loaded combat: Round ${loadedCombat.currentRound}, Active: ${loadedCombat.isActive}`);
    console.log('Participants:');
    loadedCombat.participants.forEach((p, i) => {
      console.log(`  ${p.initiative}: ${p.character.name} (${p.character.type})`);
    });
    
    console.log('\n=== TESTING CONSUMABLE USAGE ===');
    
    // Use some consumables
    loadedGandalf.useConsumable("Spell Slots", 2);
    loadedLegolas.useConsumable("Hunter's Mark");
    
    console.log('After using consumables:');
    console.log(`  ${loadedGandalf.name}: ${loadedGandalf.getConsumablesDisplay().join(', ')}`);
    console.log(`  ${loadedLegolas.name}: ${loadedLegolas.getConsumablesDisplay().join(', ')}`);
    
    // Save changes
    await repository.saveCharacter(loadedGandalf);
    await repository.saveCharacter(loadedLegolas);
    
    console.log('\n=== TESTING REST RECOVERY ===');
    
    // Trigger long rest (should restore long_rest consumables)
    await repository.triggerRest('long_rest');
    
    // Reload to see changes
    const restedGandalf = await repository.loadCharacter(gandalf.id);
    const restedLegolas = await repository.loadCharacter(legolas.id);
    
    console.log('After long rest:');
    console.log(`  ${restedGandalf.name}: ${restedGandalf.getConsumablesDisplay().join(', ')}`);
    console.log(`  ${restedLegolas.name}: ${restedLegolas.getConsumablesDisplay().join(', ')}`);
    
    console.log('\n=== TESTING TIME RECOVERY ===');
    
    // Use staff charges
    restedGandalf.useConsumable("Staff Charges", 3);
    await repository.saveCharacter(restedGandalf);
    
    console.log('After using staff charges:');
    console.log(`  ${restedGandalf.name}: ${restedGandalf.getConsumablesDisplay().join(', ')}`);
    
    // Trigger dawn (should restore dawn consumables)
    await repository.triggerTimeRecovery('dawn');
    
    const dawnGandalf = await repository.loadCharacter(gandalf.id);
    console.log('After dawn:');
    console.log(`  ${dawnGandalf.name}: ${dawnGandalf.getConsumablesDisplay().join(', ')}`);
    
    console.log('\n=== LOADING ALL CHARACTERS ===');
    const allCharacters = await repository.loadAllCharacters();
    console.log(`Found ${allCharacters.length} characters in database:`);
    allCharacters.forEach(char => {
      console.log(`  - ${char.name} (${char.type}): ${char.hp.current}/${char.hp.max} HP`);
    });
    
    console.log('\n=== DATABASE TEST COMPLETE ✅ ===');
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await database.close();
  }
}

// Run the test
testDatabase();
