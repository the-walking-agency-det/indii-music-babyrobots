import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dbConfig } from './test-db-config';

/**
 * Sets up an in-memory SQLite database for testing
 */
export async function setupSQLite() {
  const db = await open({
    filename: dbConfig.sqlite.file,
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');
  
  // Create test tables
  await db.exec(`
    -- Memories table
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      level INTEGER NOT NULL,
      importance REAL NOT NULL,
      context TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Vector documents table
    CREATE TABLE IF NOT EXISTS vector_documents (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      metadata TEXT NOT NULL,
      embedding BLOB NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Agents table
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      metadata TEXT NOT NULL,
      last_active TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );
  `);
  
  return db;
}

/**
 * Tests for the SQLite setup utility
 */
if (process.env.NODE_ENV === 'test') {
  describe('SQLite Setup', () => {
    it('should create a working database connection', async () => {
      const db = await setupSQLite();
      const result = await db.get('SELECT 1 as test');
      expect(result.test).toBe(1);
    });

    it('should enable foreign keys', async () => {
      const db = await setupSQLite();
      const result = await db.get('PRAGMA foreign_keys');
      expect(result['foreign_keys']).toBe(1);
    });

    it('should create all required tables', async () => {
      const db = await setupSQLite();
      const tables = await db.all(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      const tableNames = tables.map(t => t.name);
      
      expect(tableNames).toContain('memories');
      expect(tableNames).toContain('vector_documents');
      expect(tableNames).toContain('agents');
      expect(tableNames).toContain('tasks');
    });

    it('should enforce foreign key constraints', async () => {
      const db = await setupSQLite();
      
      // Try to create a task with non-existent agent_id
      await expect(
        db.run(
          'INSERT INTO tasks (id, agent_id, status, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          ['test-id', 'fake-agent', 'pending', '{}', new Date().toISOString(), new Date().toISOString()]
        )
      ).rejects.toThrow();
    });
  });
}
