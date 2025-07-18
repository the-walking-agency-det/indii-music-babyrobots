/**
 * Base class for database adapters.
 * Defines the interface that all database adapters must implement.
 */
export interface DatabaseAdapter {
  /**
   * Run a query that returns multiple rows
   */
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;

  /**
   * Run a query that returns a single row
   */
  get<T = any>(sql: string, params?: any[]): Promise<T | null>;

  /**
   * Run a query that doesn't return rows
   */
  run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;

  /**
   * Check if the database is connected
   */
  isConnected(): Promise<boolean>;

  /**
   * Clean up database resources
   */
  cleanup(): Promise<void>;

  /**
   * Reset database state (for testing)
   */
  reset(): Promise<void>;

  /**
   * Get the type of database being used
   */
  getDatabaseType(): string;

  /**
   * Generate a unique ID
   */
  generateId(): string;
}
