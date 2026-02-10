import { join } from 'path';
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const BACKEND_ROOT = join(import.meta.dir, '../apps/backend');
const sqlFile = join(import.meta.dir, 'clean-db.sql');

if (!existsSync(sqlFile)) {
  console.error(`❌ SQL file not found: ${sqlFile}`);
  process.exit(1);
}

console.log(`🧹 Preparing to clean database. Target: ${isRemote ? '🌊 REMOTE (Cloudflare D1)' : '💻 LOCAL (SQLite)'}...`);

if (isRemote) {
  console.log('⚠️  WARNING: You are about to wipe all data from the PRODUCTION database.');
  console.log('Press Ctrl+C to abort, or wait 5 seconds to continue...');
  await new Promise(r => setTimeout(r, 5000));
}

const wranglerArgs = [
  'wrangler',
  'd1',
  'execute',
  'progy',
  '--file',
  sqlFile,
  isRemote ? '--remote' : '--local',
  '--yes'
];

console.log(`\n🔥 Executing cleanup...`);

const result = spawnSync('bun', wranglerArgs, {
  stdio: 'inherit',
  shell: true,
  cwd: BACKEND_ROOT
});

if (result.status !== 0) {
  console.error(`\n❌ Failed to clean database.`);
  process.exit(1);
}

console.log(`\n✨ Database cleaned successfully!`);
