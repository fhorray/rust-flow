import { join } from 'path';
import { spawnSync } from 'child_process';

/**
 * Helper to update a user's profile in the database (Local or Remote)
 * Usage: 
 *   bun run scripts/update-user.ts --email=test@example.com --username=newname --name="New Name"
 *   bun run scripts/update-user.ts --remote --email=test@example.com --username=newname --name="New Name"
 */

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const BACKEND_ROOT = join(import.meta.dir, '../apps/backend');

// Simple arg parser
const getArg = (name: string) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const email = getArg('email');
const username = getArg('username');
const name = getArg('name');

if (!email) {
  console.error('❌ Error: --email is required.');
  console.log('Usage: bun run scripts/update-user.ts --email=test@example.com [--username=new] [--name="New Name"] [--remote]');
  process.exit(1);
}

if (!username && !name) {
  console.error('❌ Error: Either --username or --name must be provided.');
  process.exit(1);
}

console.log(`👤 Preparing to update user: ${email}`);
console.log(`📍 Target: ${isRemote ? '🌊 REMOTE (Cloudflare D1)' : '💻 LOCAL (SQLite)'}`);

const updates: string[] = [];
if (username) updates.push(`username = '${username}'`);
if (name) updates.push(`name = '${name}'`);

const sql = `UPDATE user SET ${updates.join(', ')} WHERE email = '${email}';`;

console.log(`\n📝 SQL Query: ${sql}`);

const wranglerArgs = [
  'd1',
  'execute',
  'progy',
  '--command',
  sql,
  ...(isRemote ? ['--remote'] : ['--local']),
  '--yes'
];

console.log(`\n🚀 Executing: wrangler ${wranglerArgs.join(' ')}`);

const result = spawnSync('npx', ['wrangler', ...wranglerArgs], {
  stdio: 'inherit',
  shell: true,
  cwd: BACKEND_ROOT
});

if (result.status !== 0) {
  console.error(`\n❌ Failed to update user.`);
  process.exit(1);
}

console.log(`\n✨ User updated successfully!`);
