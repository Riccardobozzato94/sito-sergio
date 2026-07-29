// ══════════════════════════════════════════════════════════════
// Migration Script — Panificio Da Sergio
// Usage: node scripts/migrate.js
// You'll need the Supabase database password (from project settings)
// ══════════════════════════════════════════════════════════════

import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = resolve(__dirname, '..', 'supabase', 'migrations');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

/** Ottiene la lista dei file SQL di migrazione in ordine alfabetico */
function getMigrationFiles() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();  // Ordine alfabetico → 001_, 002_, ..., 011_
  return files;
}

/** Esegue un file SQL, statement per statement */
async function runMigrationFile(client, fileName) {
  const filePath = join(MIGRATIONS_DIR, fileName);
  const sql = readFileSync(filePath, 'utf-8');
  const lines = sql.split('\n');

  // Rimuovi commenti SQL (-- ...) e righe vuote, ma tieni i separatori
  const statements = [];
  let currentStmt = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Salta righe vuote e commenti interi
    if (trimmed === '' || trimmed.startsWith('--')) {
      // Se accumuliamo uno statement e troviamo un commento, è parte dello stesso blocco?
      // I commenti tra statement vengono scartati.
      continue;
    }

    currentStmt += line + '\n';

    // Se la riga finisce con ';', è la fine di uno statement
    if (trimmed.endsWith(';')) {
      statements.push(currentStmt.trim());
      currentStmt = '';
    }
  }

  // Se resta roba senza ; finale, aggiungila
  if (currentStmt.trim()) {
    statements.push(currentStmt.trim());
  }

  let executed = 0;
  for (const stmt of statements) {
    if (!stmt || stmt === ';') continue;
    try {
      await client.query(stmt);
      executed++;
    } catch (err) {
      // Ignora errori comuni di idempotenza
      const ignorePatterns = [
        'already exists',
        'duplicate key',
        'Duplicate',
      ];
      const isIgnorable = ignorePatterns.some((p) => err.message.includes(p));
      if (isIgnorable) {
        console.log(`  ~ ${fileName}: già applicato, skip`);
      } else {
        console.error(`  ✗ ${fileName}: ${err.message}`);
        console.log(`    Statement: ${stmt.slice(0, 120)}...`);
      }
    }
  }
  return executed;
}

async function main() {
  console.log('\n🍞 Panificio Da Sergio — Database Migration\n');
  console.log('Esegue TUTTI i file SQL in supabase/migrations/ in ordine numerico.\n');

  const password = await ask('Password database Supabase (Dashboard → Project Settings → Database): ');

  const pool = new pg.Pool({
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.gohhqrbcaqvpkcltazzk',
    password: password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connessione...');
    const client = await pool.connect();
    console.log('Connesso! Esecuzione migrazioni...\n');

    const migrationFiles = getMigrationFiles();
    console.log(`Trovati ${migrationFiles.length} file di migrazione:\n`);

    let totalExecuted = 0;
    for (const file of migrationFiles) {
      process.stdout.write(`  ${file}... `);
      const count = await runMigrationFile(client, file);
      if (count > 0) {
        console.log(`✓ (${count} statement)`);
      } else {
        console.log('✓');
      }
      totalExecuted += count;
    }

    console.log(`\n✅ Migrazione completata! ${totalExecuted} statement eseguiti.\n`);
    console.log('Prossimi passi:');
    console.log('  1. Crea utente admin in Authentication → Users → Add User');
    console.log('     (es. sergio@panificiodasergio.it)');
    console.log('  2. Collega l\'utente auth alla tabella crm_users:');
    console.log('     INSERT INTO crm_users (id, role, full_name)');
    console.log('     VALUES (\'{user_uuid}\', \'admin\', \'Sergio\');');
    console.log('  3. Configura Stripe (vedi STATO-PROGETTO.md)');
    console.log('');

    client.release();
  } catch (err) {
    console.error('\n❌ Connessione fallita:', err.message);
    console.log('\nVerifica:');
    console.log('  1. Password corretta');
    console.log('  2. Il tuo IP è permesso (Supabase > Authentication > Settings > Allow IPs)');
    console.log('  3. Oppure esegui il SQL manualmente nel Supabase SQL Editor\n');
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
