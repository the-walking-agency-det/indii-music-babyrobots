// Test Database Configuration
const testConfig = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'indii_music_test',
      user: 'postgres',
      password: 'postgres'
    },
    migrations: {
      directory: 'prisma/migrations'
    },
    seeds: {
      directory: 'prisma/seed/test'
    }
  }
};

module.exports = testConfig;
