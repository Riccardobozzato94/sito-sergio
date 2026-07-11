// ══════════════════════════════════════════════════════════════
// Migration Script — Panificio Da Sergio
// Usage: node scripts/migrate.js
// You'll need the Supabase database password (from project settings)
// ══════════════════════════════════════════════════════════════

import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('\n🍞 Panificio Da Sergio — Database Migration\n');
  console.log('This script will create the orders, site_content tables and set up RLS.\n');

  const password = await ask('Supabase database password (find it in Dashboard > Project Settings > Database): ');

  const pool = new pg.Pool({
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.gohhqrbcaqvpkcltazzk',
    password: password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting...');
    const client = await pool.connect();
    console.log('Connected! Running migration...\n');

    const sqlPath = resolve(__dirname, '..', 'supabase', 'migrations', '001_orders_content.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await client.query(stmt + ';');
        console.log('  ✓ Statement executed');
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists')) {
          console.log('  - Already exists, skipping');
        } else {
          console.error(`  ✗ Error: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Migration complete!\n');
    console.log('New tables created:');
    console.log('  - orders (online payments)');
    console.log('  - site_content (editable texts)');
    console.log('  - RLS policies on products table');
    console.log('\nNext steps:');
    console.log('  1. Create an admin user:');
    console.log('     Go to Supabase Dashboard > Authentication > Users > Add User');
    console.log('     Email: sergio@panificiodasergio.it (or any email)');
    console.log('     Password: choose a secure one');
    console.log('');
    console.log('  2. Set up Stripe:');
    console.log('     - Create a Stripe account at stripe.com');
    console.log('     - Get your publishable key (pk_live_xxx)');
    console.log('     - Add VITE_STRIPE_PUBLISHABLE_KEY to .env');
    console.log('');
    console.log('  3. Deploy the Edge Function:');
    console.log('     npx supabase functions deploy create-checkout');
    console.log('     npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx');
    console.log('     npx supabase secrets set SITE_URL=https://panificiodasergio.it');
    console.log('');

    client.release();
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    console.log('\nMake sure:');
    console.log('  1. The password is correct');
    console.log('  2. Your IP is allowed (Supabase > Authentication > Settings > Allow IPs)');
    console.log('  3. Or run the SQL manually in the Supabase SQL Editor\n');
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
