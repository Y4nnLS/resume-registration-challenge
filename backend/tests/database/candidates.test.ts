import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sql from 'mssql';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { createDatabasePool } from '../../src/config/database.js';
import { readDatabaseConfig } from '../../src/config/env.js';
import { createCandidateRepository } from '../../src/repositories/candidate.repository.js';
import { createCandidateService } from '../../src/services/candidate.service.js';

let pool: sql.ConnectionPool | undefined;
let app: ReturnType<typeof createApp>;
let databaseVerified = false;
const createdIds: number[] = [];
const readScript = (name: string) =>
  readFile(new URL(`../../database/${name}`, import.meta.url), 'utf8');

beforeAll(async () => {
  const configuration = readDatabaseConfig(process.env, 'test');
  pool = createDatabasePool(configuration);
  await pool.connect();
  const result = await pool.request().query<{ name: string }>('SELECT DB_NAME() AS name');
  const connectedName = result.recordset[0].name;
  if (
    !/_test$/i.test(connectedName) ||
    connectedName.toLowerCase() !== configuration.database?.toLowerCase()
  ) {
    throw new Error(
      'Connected database is not the configured test database. Aborting without writes.',
    );
  }
  databaseVerified = true;
  const schema = await readScript('01-create-candidates.sql');
  await pool.request().batch(schema);
  await pool.request().batch(schema);
  app = createApp(createCandidateService(createCandidateRepository(pool)));
});

afterAll(async () => {
  if (!pool) return;
  try {
    if (databaseVerified) {
      for (const id of createdIds) {
        await pool
          .request()
          .input('id', sql.Int, id)
          .query('DELETE FROM dbo.Candidates WHERE id = @id');
      }
    }
  } finally {
    await pool.close();
  }
});

describe('candidate API with real SQL Server', () => {
  it('runs the schema and seed repeatedly without duplicating seed data', async () => {
    const seed = await readScript('seed.sql');
    await pool!.request().batch(seed);
    const first = await pool!
      .request()
      .query<{ count: number }>('SELECT COUNT(*) AS count FROM dbo.Candidates');
    await pool!.request().batch(seed);
    const second = await pool!
      .request()
      .query<{ count: number }>('SELECT COUNT(*) AS count FROM dbo.Candidates');

    expect(second.recordset[0].count).toBe(first.recordset[0].count);
  });

  it('persists and retrieves candidates while allowing duplicate emails', async () => {
    const email = `fixture.${randomUUID()}@example.com`;
    const first = await request(app)
      .post('/api/candidates')
      .send({ fullName: 'Candidata Integração', email });
    const second = await request(app)
      .post('/api/candidates')
      .send({ fullName: 'Outra Candidata', email });
    createdIds.push(first.body.id, second.body.id);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.id).not.toBe(first.body.id);
    expect((await request(app).get(`/api/candidates/${first.body.id}`)).body).toMatchObject({
      id: first.body.id,
      email,
    });
  });
});
