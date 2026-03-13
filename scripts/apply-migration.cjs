/**
 * Script to apply database migration to Supabase
 * 
 * This script reads the SQL migration file and provides instructions
 * for applying it to your Supabase database.
 */

const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('\n==============================================');
console.log('Life Moments - Database Migration');
console.log('==============================================\n');

console.log('Please follow these steps to apply the migration:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/sql/new');
console.log('2. Copy the SQL below and paste it into the SQL Editor');
console.log('3. Click "Run" to execute the migration\n');

console.log('==============================================');
console.log('SQL MIGRATION:');
console.log('==============================================\n');
console.log(sql);
console.log('\n==============================================');
console.log('End of SQL Migration');
console.log('==============================================\n');

