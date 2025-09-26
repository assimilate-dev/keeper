const database = require('./setup');
const { Character, Combat, Consumable, generateId } = require('../models/core');

class Repository {
  // Character operations
  async saveCharacter(character) {
    const sql = `
      INSERT OR REPLACE INTO characters (id, name, type, ac, hp_current, hp_max, conditions, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      character.id,
      character.name,
      character.type,
      character.ac,
      character.hp?.current || null,
      character.hp?.max || null,
      JSON.stringify(character.conditions || []),
      character.notes || ''
    ];

    await database.run(sql, params);
    
    // Save consumables separately
    await this.saveCharacterConsumables(character);
    
    return character;
  }

  async loadCharacter(characterId) {
    const sql = 'SELECT * FROM characters WHERE id = ?';
    const row = await database.get(sql, [characterId]);
    
    if (!row) return null;

    // Reconstruct character object
    const characterData = {
      id: row.id,
      name: row.name,
      type: row.type,
      ac: row.ac,
      hp: row.hp_current !== null ? {
        current: row.hp_current,
        max: row.hp_max
      } : null,
      notes: row.notes || ''
    };

    const character = new Character(characterData);
    character.conditions = JSON.parse(row.conditions || '[]');
    
    // Load consumables
    character.consumables = await this.loadCharacterConsumables(characterId);
    
    return character;
  }

  async loadAllCharacters() {
    const sql = 'SELECT * FROM characters ORDER BY name';
    const rows = await database.all(sql);
    
    const characters = [];
    for (const row of rows) {
      const character = await this.loadCharacter(row.id);
      if (character) {
        characters.push(character);
      }
    }
    
    return characters;
  }

  async deleteCharacter(characterId) {
    const sql = 'DELETE FROM characters WHERE id = ?';
    await database.run(sql, [characterId]);
  }

  // Consumable operations
  async saveConsumable(consumable) {
    const sql = `
      INSERT OR REPLACE INTO consumables 
      (id, character_id, name, current_charges, max_charges, reset_condition, recovery_type, recovery_amount, description, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      consumable.id,
      null, // Will be set by saveCharacterConsumables
      consumable.name,
      consumable.charges.current,
      consumable.charges.max,
      consumable.resetCondition,
      consumable.recoveryType,
      consumable.recoveryAmount || null,
      consumable.description || '',
      consumable.notes || ''
    ];

    await database.run(sql, params);
    return consumable;
  }

  async saveCharacterConsumables(character) {
    // First, remove existing consumables for this character
    await database.run('DELETE FROM consumables WHERE character_id = ?', [character.id]);
    
    // Then insert current consumables
    for (const consumable of character.consumables) {
      const sql = `
        INSERT INTO consumables 
        (id, character_id, name, current_charges, max_charges, reset_condition, recovery_type, recovery_amount, description, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        consumable.id,
        character.id,
        consumable.name,
        consumable.charges.current,
        consumable.charges.max,
        consumable.resetCondition,
        consumable.recoveryType,
        consumable.recoveryAmount || null,
        consumable.description || '',
        consumable.notes || ''
      ];

      await database.run(sql, params);
    }
  }

  async loadCharacterConsumables(characterId) {
    const sql = 'SELECT * FROM consumables WHERE character_id = ? ORDER BY name';
    const rows = await database.all(sql, [characterId]);
    
    return rows.map(row => {
      const consumableData = {
        id: row.id,
        name: row.name,
        charges: {
          current: row.current_charges,
          max: row.max_charges
        },
        resetCondition: row.reset_condition,
        recoveryType: row.recovery_type,
        recoveryAmount: row.recovery_amount,
        description: row.description || '',
        notes: row.notes || ''
      };
      
      return new Consumable(consumableData);
    });
  }

  async moveConsumable(consumableId, fromCharacterId, toCharacterId) {
    const sql = 'UPDATE consumables SET character_id = ? WHERE id = ? AND character_id = ?';
    const result = await database.run(sql, [toCharacterId, consumableId, fromCharacterId]);
    return result.changes > 0;
  }

  // Combat operations
  async saveCombat(combat) {
    const sql = `
      INSERT OR REPLACE INTO combats (id, name, current_round, current_turn_index, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      combat.id,
      combat.name || 'Combat Encounter',
      combat.currentRound,
      combat.currentTurnIndex,
      combat.isActive ? 1 : 0
    ];

    await database.run(sql, params);
    
    // Save participants
    await this.saveCombatParticipants(combat);
    
    return combat;
  }

  async saveCombatParticipants(combat) {
    // Remove existing participants
    await database.run('DELETE FROM combat_participants WHERE combat_id = ?', [combat.id]);
    
    // Insert current participants
    for (const participant of combat.participants) {
      const sql = `
        INSERT INTO combat_participants (combat_id, character_id, initiative, is_active, joined_round)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const params = [
        combat.id,
        participant.character.id,
        participant.initiative,
        participant.isActive ? 1 : 0,
        participant.joinedRound || 1
      ];

      await database.run(sql, params);
    }
  }

  async loadCombat(combatId) {
    const sql = 'SELECT * FROM combats WHERE id = ?';
    const row = await database.get(sql, [combatId]);
    
    if (!row) return null;

    const combat = new Combat();
    combat.id = row.id;
    combat.name = row.name;
    combat.currentRound = row.current_round;
    combat.currentTurnIndex = row.current_turn_index;
    combat.isActive = row.is_active === 1;
    
    // Load participants
    const participantsSql = `
      SELECT cp.*, c.* FROM combat_participants cp
      JOIN characters c ON cp.character_id = c.id
      WHERE cp.combat_id = ?
      ORDER BY cp.initiative DESC
    `;
    
    const participantRows = await database.all(participantsSql, [combatId]);
    
    combat.participants = [];
    for (const row of participantRows) {
      const character = await this.loadCharacter(row.character_id);
      if (character) {
        combat.participants.push({
          character: character,
          initiative: row.initiative,
          isActive: row.is_active === 1,
          joinedRound: row.joined_round
        });
      }
    }
    
    return combat;
  }

  async loadActiveCombat() {
    const sql = 'SELECT id FROM combats WHERE is_active = 1 LIMIT 1';
    const row = await database.get(sql);
    
    if (row) {
      return await this.loadCombat(row.id);
    }
    
    return null;
  }

  async deleteCombat(combatId) {
    const sql = 'DELETE FROM combats WHERE id = ?';
    await database.run(sql, [combatId]);
  }

  // Scenario operations
  async saveScenario(scenario) {
    const sql = `
      INSERT OR REPLACE INTO scenarios (id, name, is_active, start_time, elapsed_time)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      scenario.id,
      scenario.name,
      scenario.isActive ? 1 : 0,
      scenario.startTime,
      scenario.elapsedTime
    ];

    await database.run(sql, params);
    return scenario;
  }

  async loadActiveScenario() {
    const sql = 'SELECT * FROM scenarios WHERE is_active = 1 LIMIT 1';
    const row = await database.get(sql);
    
    if (row) {
      return {
        id: row.id,
        name: row.name,
        isActive: row.is_active === 1,
        startTime: row.start_time,
        elapsedTime: row.elapsed_time
      };
    }
    
    return null;
  }

  async deactivateAllScenarios() {
    const sql = 'UPDATE scenarios SET is_active = 0';
    await database.run(sql);
  }

  // Utility methods
  async triggerRest(restType) {
    const sql = `
      UPDATE consumables 
      SET current_charges = max_charges 
      WHERE reset_condition = ? AND character_id IS NOT NULL
    `;
    
    await database.run(sql, [restType]);
  }

  async triggerTimeRecovery(timeCondition) {
    const sql = `
      UPDATE consumables 
      SET current_charges = max_charges 
      WHERE reset_condition = ? AND character_id IS NOT NULL
    `;
    
    await database.run(sql, [timeCondition]);
  }
}

// Singleton instance
const repository = new Repository();

module.exports = repository;
