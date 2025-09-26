const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE_VERSION = 1;
const DB_PATH = path.join(__dirname, '../../keeper.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  async setup() {
    await this.connect();
    await this.createTables();
    console.log('Database setup complete');
  }

  createTables() {
    return new Promise((resolve, reject) => {
      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create all tables in sequence
        this.db.serialize(() => {
          // Scenarios table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS scenarios (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              is_active BOOLEAN NOT NULL DEFAULT 0,
              start_time INTEGER,
              elapsed_time INTEGER DEFAULT 0,
              created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
          `);

          // Add constraint to ensure only one active scenario
          this.db.run(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_scenarios_active 
            ON scenarios(is_active) 
            WHERE is_active = 1
          `);

          // Characters table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS characters (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              type TEXT NOT NULL CHECK (type IN ('pc', 'enemy', 'lair')),
              ac INTEGER,
              hp_current INTEGER,
              hp_max INTEGER,
              conditions TEXT DEFAULT '[]',
              notes TEXT DEFAULT '',
              created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
          `);

          // Consumables table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS consumables (
              id TEXT PRIMARY KEY,
              character_id TEXT,
              name TEXT NOT NULL,
              current_charges INTEGER NOT NULL,
              max_charges INTEGER NOT NULL,
              reset_condition TEXT NOT NULL CHECK (reset_condition IN ('long_rest', 'short_rest', 'dawn', 'dusk', 'never')),
              recovery_type TEXT NOT NULL DEFAULT 'full',
              recovery_amount INTEGER,
              description TEXT DEFAULT '',
              notes TEXT DEFAULT '',
              created_at INTEGER DEFAULT (strftime('%s', 'now')),
              FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
            )
          `);

          // Combats table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS combats (
              id TEXT PRIMARY KEY,
              name TEXT DEFAULT 'Combat Encounter',
              current_round INTEGER DEFAULT 0,
              current_turn_index INTEGER DEFAULT 0,
              is_active BOOLEAN NOT NULL DEFAULT 0,
              created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
          `);

          // Combat participants table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS combat_participants (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              combat_id TEXT NOT NULL,
              character_id TEXT NOT NULL,
              initiative INTEGER NOT NULL,
              is_active BOOLEAN NOT NULL DEFAULT 1,
              joined_round INTEGER DEFAULT 1,
              created_at INTEGER DEFAULT (strftime('%s', 'now')),
              FOREIGN KEY (combat_id) REFERENCES combats(id) ON DELETE CASCADE,
              FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
              UNIQUE(combat_id, character_id)
            )
          `);

          // Database metadata table for versioning
          this.db.run(`
            CREATE TABLE IF NOT EXISTS db_metadata (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              updated_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
          `);

          // Insert database version
          this.db.run(`
            INSERT OR REPLACE INTO db_metadata (key, value) 
            VALUES ('version', ?)
          `, [DATABASE_VERSION], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });
    });
  }

  // Utility method to run queries with promises
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Utility method to get single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Utility method to get all rows
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

// Singleton instance
const database = new Database();

module.exports = database;
