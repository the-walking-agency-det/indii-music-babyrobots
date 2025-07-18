import { DatabaseAdapter } from '../../lib/db-adapter';
import { supabase } from '../../lib/supabase';
import { PrismaClient } from '@prisma/client';
import { mockCrypto } from '../mocks/crypto';

/**
 * Test Database Adapter
 * Handles all database operations in test environment
 */
export class TestDatabaseAdapter implements DatabaseAdapter {
  private static instance: TestDatabaseAdapter;
  private dbType: 'sqlite' | 'prisma' | 'supabase';
  private db: any;

private constructor() {
    // Initialize database operations
    this.query = this.query.bind(this);
    this.get = this.get.bind(this);
    this.run = this.run.bind(this);
    this.isConnected = this.isConnected.bind(this);
    this.dbType = process.env.TEST_DATABASE_TYPE || 'sqlite';
  }

  private static async initialize(): Promise<TestDatabaseAdapter> {
    if (!TestDatabaseAdapter.instance) {
      TestDatabaseAdapter.instance = new TestDatabaseAdapter();
      await TestDatabaseAdapter.instance.setup();
    }
    return TestDatabaseAdapter.instance;
  }

  private async setup(): Promise<void> {
    console.log(`🔄 Using ${this.dbType} database adapter`);
    
    if (this.dbType === 'sqlite') {
      const sqlite3 = (await import('sqlite3')).verbose();
      
      // Create a promise wrapper for the database connection
      this.db = await new Promise<any>((resolve, reject) => {
        const db = new sqlite3.Database(':memory:', (err: Error) => {
          if (err) {
            console.error('Error opening database:', err);
            reject(err);
          } else {
            console.log('Connected to in-memory SQLite database');
            resolve(db);
          }
        });
      });

      // Promisify the run method for easier async usage
      const runAsync = (sql: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          this.db.run(sql, (err: Error) => {
            if (err) reject(err);
            else resolve();
          });
        });
      };

      // Set up SQLite configuration
      await runAsync('PRAGMA journal_mode = WAL');
      await runAsync('PRAGMA busy_timeout = 5000');
      await runAsync('PRAGMA synchronous = OFF');
      await runAsync('PRAGMA foreign_keys = ON');

      // Create all required tables
      await runAsync(`
        CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          importance REAL DEFAULT 0.5,
          tags TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS vector_documents (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          vector TEXT,
          metadata TEXT,
          namespace TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS agents (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          metadata TEXT,
          timestamp TEXT NOT NULL
        )
      `);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          agent_id TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL,
          data TEXT,
          timestamp TEXT NOT NULL,
          FOREIGN KEY (agent_id) REFERENCES agents(id)
        )
      `);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          agent_id TEXT NOT NULL,
          context TEXT,
          timestamp TEXT NOT NULL,
          FOREIGN KEY (agent_id) REFERENCES agents(id)
        )
      `);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          metadata TEXT,
          timestamp TEXT NOT NULL
        )
      `);

    } else if (this.dbType === 'prisma') {
      const { PrismaClient } = await import('@prisma/client');
      this.db = new PrismaClient({
        datasources: {
          db: {
            url: process.env.TEST_DATABASE_URL || 'file:./test.db'
          }
        }
      });
    } else if (this.dbType === 'supabase') {
      const { createClient } = await import('@supabase/supabase-js');
      this.db = createClient(
        process.env.TEST_SUPABASE_URL || '',
        process.env.TEST_SUPABASE_KEY || ''
      );
    }
  }

  public static async getInstance(): Promise<TestDatabaseAdapter> {
    return TestDatabaseAdapter.initialize();
  }

  /**
   * Reset all test data
   */
  public async reset(): Promise<void> {
    switch (this.dbType) {
      case 'sqlite':
        await this.resetSQLite();
        break;
      case 'prisma':
        await this.resetPrisma();
        break;
      case 'supabase':
        await this.resetSupabase();
        break;
    }
  }

  /**
   * Clean up database connections
   */
  public async cleanup(): Promise<void> {
    if (this.dbType === 'prisma') {
      await this.prisma.$disconnect();
    }
  }

  private async resetSQLite(): Promise<void> {
    // For SQLite, we can just delete all data from tables
    const tables = [
      'memories',
      'vector_documents',
      'agents',
      'tasks',
      'sessions',
      'users'
    ];

    for (const table of tables) {
      await this.run(`DELETE FROM ${table}`);
    }
  }

  private async resetPrisma(): Promise<void> {
    // For Prisma, use truncate with cascade
    await this.prisma.$transaction([
      this.prisma.memory.deleteMany(),
      this.prisma.vectorDocument.deleteMany(),
      this.prisma.agent.deleteMany(),
      this.prisma.task.deleteMany(),
      this.prisma.session.deleteMany(),
      this.prisma.user.deleteMany()
    ]);
  }

  /**
   * Run a query that returns multiple rows
   */
  public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    // Run the query based on the database type
    switch (this.dbType) {
      case 'sqlite':
        return new Promise((resolve, reject) => {
          this.db.all(sql, params, (err: Error, rows: T[]) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      case 'prisma':
        return this.prisma.$queryRaw(sql, ...(params || []));
      case 'supabase':
        const { data, error } = await supabase.rpc('query', { sql, params });
        if (error) throw error;
        return data;
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }

  /**
   * Run a query that returns a single row
   */
  public async get<T = any>(sql: string, params?: any[]): Promise<T | null> {
    // Run the query based on the database type
    switch (this.dbType) {
      case 'sqlite':
        return new Promise((resolve, reject) => {
          this.db.get(sql, params, (err: Error, row: T) => {
            if (err) reject(err);
            else resolve(row || null);
          });
        });
      case 'prisma':
        const results = await this.prisma.$queryRaw(sql, ...(params || []));
        return results[0] || null;
      case 'supabase':
        const { data, error } = await supabase.rpc('query_single', { sql, params });
        if (error) throw error;
        return data[0] || null;
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }

  /**
   * Run a query that doesn't return rows
   */
  public async run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> {
    // Run the query based on the database type
    switch (this.dbType) {
      case 'sqlite':
        return new Promise((resolve, reject) => {
          this.db.run(sql, params, function(err: Error) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });
      case 'prisma':
        const result = await this.prisma.$executeRaw(sql, ...(params || []));
        return { lastID: 0, changes: result };
      case 'supabase':
        const { data, error } = await supabase.rpc('execute', { sql, params });
        if (error) throw error;
        return { lastID: data?.lastID || 0, changes: data?.changes || 0 };
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }

  private async resetSupabase(): Promise<void> {
    // For Supabase, use RLS-safe deletion
    const tables = [
      'memories',
      'vector_documents',
      'agents',
      'tasks',
      'sessions',
      'users'
    ];

    for (const table of tables) {
      await supabase.from(table).delete().neq('id', 0); // Delete all rows
    }
  }

  /**
   * Override crypto operations to use test crypto
   */
  public generateId(): string {
    return mockCrypto.randomUUID();
  }

  /**
   * Get the current database type
   */
  public getDatabaseType(): string {
    return this.dbType;
  }

  /**
   * Check if database is connected
   */
  public async isConnected(): Promise<boolean> {
    try {
      switch (this.dbType) {
        case 'sqlite':
          // For SQLite, just try a simple query
          await this.query('SELECT 1');
          return true;

        case 'prisma':
          // For Prisma, use $queryRaw
          await this.prisma.$queryRaw`SELECT 1`;
          return true;

        case 'supabase':
          // For Supabase, check connection
          const { data, error } = await supabase
            .from('_schema')
            .select('version')
            .single();
          return !error && !!data;

        default:
          return false;
      }
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }
}
