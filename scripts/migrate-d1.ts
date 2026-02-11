import { readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const BACKEND_ROOT = join(import.meta.dir, '../apps/backend');
const migrationDir = join(BACKEND_ROOT, 'src/db/migrations');

// Find all .sql files in the drizzle directory
const migrations = readdirSync(migrationDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Ensure 0000, 0001 order

if (migrations.length === 0) {
  console.log('No migrations found.');
  process.exit(0);
}

console.log(`🚀 Found ${migrations.length} migrations. Applying to ${isRemote ? '🌊 REMOTE (Cloudflare D1)' : '💻 LOCAL (SQLite)'}...`);

for (const migration of migrations) {
  const filePath = join(migrationDir, migration);
  console.log(`\n📦 Applying: ${migration}...`);

  const wranglerArgs = [
    'wrangler',
    'd1',
    'execute',
    'progy',
    '--file',
    filePath,
    isRemote ? '--remote' : '--local',
    '--yes'
  ];

  const result = spawnSync('bun', wranglerArgs, {
    stdio: 'pipe',
    shell: true,
    cwd: BACKEND_ROOT
  });

  if (result.status !== 0) {
    console.error(`❌ Failed to apply migration: ${migration}`);
    console.error(result.stderr.toString());
    console.error(result.stdout.toString());
    console.error(`   (This might happen if the migration was already applied. Check D1 dashboard if unsure.)`);
    // Optional: break; if you want to stop on first error
  } else {
    console.log(`✅ Success: ${migration}`);
  }
}

console.log('\n✨ Database migration process completed!');
