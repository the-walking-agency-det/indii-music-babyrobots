#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const testConfig = require('../src/config/test-db.config');

const config = testConfig.development;

async function setupTestDatabase() {
  const client = new Client({
    host: config.connection.host,
    port: config.connection.port,
    user: config.connection.user,
    password: config.connection.password,
    database: 'postgres' // Connect to default database first
  });

  try {
    console.log('🔄 Setting up test database...');
    
    // Connect to PostgreSQL
    await client.connect();
    
    // Create test database if it doesn't exist
    try {
      await client.query(`CREATE DATABASE ${config.connection.database}`);
      console.log(`✅ Created database: ${config.connection.database}`);
    } catch (error) {
      if (error.code === '42P04') { // Database already exists
        console.log(`ℹ️ Database ${config.connection.database} already exists`);
      } else {
        throw error;
      }
    }
    
    // Close connection to postgres database
    await client.end();
    
    // Connect to test database
    const testClient = new Client(config.connection);
    await testClient.connect();
    
    // Run migrations
    console.log('🔄 Running migrations...');
    const migrationFiles = fs.readdirSync(path.resolve(__dirname, '..', config.migrations.directory))
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      const migration = fs.readFileSync(
        path.resolve(__dirname, '..', config.migrations.directory, file),
        'utf8'
      );
      await testClient.query(migration);
    }
    console.log('✅ Migrations complete');
    
    // Run seed
console.log('🔄 Running test seeds...');
    // Get all seed files and ensure correct order
    const seedFiles = fs.readdirSync(path.resolve(__dirname, '..', config.seeds.directory))
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => {
        // Ensure numbered files are executed in order
        const aNum = parseInt(a.match(/^(\d+)/)?.[1] || '0');
        const bNum = parseInt(b.match(/^(\d+)/)?.[1] || '0');
        return aNum - bNum;
      });
    
    for (const file of seedFiles) {
      const seed = fs.readFileSync(
        path.resolve(__dirname, '..', config.seeds.directory, file),
        'utf8'
      );
      await testClient.query(seed);
    }
    console.log('✅ Test data seeded');
    
    // Verify setup
    const { rows: tables } = await testClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Test database tables:');
    tables.forEach(({ table_name }) => console.log(`  • ${table_name}`));
    
    const { rows: users } = await testClient.query('SELECT email, profile_type FROM users;');
    console.log('\n👥 Test users created:');
    users.forEach(user => console.log(`  • ${user.email} (${user.profile_type})`));
    
    console.log('\n✅ Test database setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

async function resetTestDatabase() {
  console.log('🔄 Resetting test database...');
  
  const client = new Client(config.connection);
  
  try {
    await client.connect();
    
    // Truncate all tables
    await client.query(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    console.log('✅ Tables cleared');
    
    // Re-run seeds
    console.log('🔄 Re-seeding test data...');
    const seedDir = path.resolve(__dirname, '..', 'supabase', 'seeds', 'test');
    const seedFiles = [
      '01_initial_data.sql',
      '02_music_data.sql'
    ];
    
    for (const file of seedFiles) {
      console.log(`Running seed file: ${file}`);
      const seedPath = path.join(seedDir, file);
      const seed = fs.readFileSync(seedPath, 'utf8');
      try {
        await client.query(seed);
        console.log(`✅ Successfully executed ${file}`);
      } catch (error) {
        console.error(`❌ Error executing ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('✅ Test data re-seeded');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupTestDatabase();
    break;
  case 'reset':
    resetTestDatabase();
    break;
  default:
    console.log(`
Usage: node manage-test-db.js <command>

Commands:
  setup   Create and set up the test database
  reset   Clear and re-seed the test database
    `);
}
