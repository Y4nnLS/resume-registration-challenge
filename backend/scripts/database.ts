import { readFile } from 'node:fs/promises';
import { createDatabasePool } from '../src/config/database.js';
import { readDatabaseConfig } from '../src/config/env.js';

const command = process.argv[2];
if (command !== 'setup' && command !== 'seed') {
  throw new Error('Use npm run db:setup or npm run db:seed.');
}
const filename = command === 'setup' ? '01-create-candidates.sql' : 'seed.sql';
const pool = createDatabasePool(readDatabaseConfig());
try {
  await pool.connect();
  const script = await readFile(new URL(`../database/${filename}`, import.meta.url), 'utf8');
  const result = await pool.request().batch(script);
  console.info(
    command === 'setup' ? 'Candidate schema is ready.' : `Seed: ${result.recordset[0].status}`,
  );
} catch {
  console.error('Database command failed. Check DB_*, SQL Server permissions and schema setup.');
  process.exitCode = 1;
} finally {
  await pool.close();
}
