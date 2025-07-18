/**
 * Database configuration for test environment
 */
export const dbConfig = {
  sqlite: {
    file: ':memory:', // Use in-memory for tests
    pragma: {
      foreign_keys: 'ON'
    }
  },
  
  prisma: {
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL
      }
    },
    log: ['error']
  },
  
  supabase: {
    url: process.env.TEST_SUPABASE_URL,
    key: process.env.TEST_SUPABASE_KEY,
    options: {
      schema: 'test'
    }
  }
};
