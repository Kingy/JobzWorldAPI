import { readFileSync } from 'fs';
import { join } from 'path';
import { query, connectDB, closePool } from './connection';

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('📝 Running migrations...');
    
    // Read the migrations SQL file
    const migrationsPath = join(__dirname, 'migrations.sql');
    const migrationSQL = readFileSync(migrationsPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

async function rollbackMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('🗑️ Rolling back migrations...');
    
    // List of tables to drop in reverse order (to handle foreign keys)
    const tables = [
      'audit_logs',
      'interviews',
      'user_preferences',
      'uploaded_files',
      'billing_events',
      'employer_subscriptions',
      'subscription_plans',
      'notifications',
      'messages',
      'conversations',
      'password_reset_tokens',
      'user_sessions',
      'ai_match_scores',
      'job_applications',
      'video_responses',
      'candidate_profiles',
      'job_postings',
      'companies',
      'users'
    ];
    
    for (const table of tables) {
      await query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`📋 Dropped table: ${table}`);
    }
    
    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Get command line argument
const command = process.argv[2];

switch (command) {
  case 'up':
    runMigrations();
    break;
  case 'down':
    rollbackMigrations();
    break;
  default:
    console.log('Usage: npm run migrate:up or npm run migrate:down');
    process.exit(1);
}