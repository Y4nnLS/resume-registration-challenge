import type { config as SqlConfig } from 'mssql';
import { z } from 'zod';

const portSchema = z.coerce.number().int().min(1).max(65535);
const booleanSchema = z.enum(['true', 'false']).transform((value) => value === 'true');
const databaseSchema = z.object({
  server: z.string().trim().min(1),
  port: portSchema,
  database: z.string().trim().min(1),
  user: z.string().trim().min(1),
  password: z.string().min(1),
  encrypt: booleanSchema,
  trustServerCertificate: booleanSchema,
});

export function readPort(environment: NodeJS.ProcessEnv = process.env): number {
  const result = portSchema.safeParse(environment.PORT ?? '3000');
  if (!result.success) throw new Error('PORT must be an integer between 1 and 65535.');
  return result.data;
}

export function readDatabaseConfig(
  environment: NodeJS.ProcessEnv = process.env,
  target: 'development' | 'test' = 'development',
): SqlConfig {
  const prefix = target === 'test' ? 'TEST_DB' : 'DB';
  const result = databaseSchema.safeParse({
    server: environment[`${prefix}_SERVER`],
    port: environment[`${prefix}_PORT`] ?? '1433',
    database: environment[`${prefix}_NAME`],
    user: environment[`${prefix}_USER`],
    password: environment[`${prefix}_PASSWORD`],
    encrypt: environment[`${prefix}_ENCRYPT`] ?? 'true',
    trustServerCertificate: environment[`${prefix}_TRUST_SERVER_CERTIFICATE`] ?? 'false',
  });
  if (!result.success)
    throw new Error(
      `Invalid ${prefix}_* configuration: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}.`,
    );
  if (target === 'test' && !/_test$/i.test(result.data.database)) {
    throw new Error('TEST_DB_NAME must end in _test. No database operation was permitted.');
  }
  const { encrypt, trustServerCertificate, ...connection } = result.data;
  return {
    ...connection,
    options: { encrypt, trustServerCertificate, useUTC: true },
    pool: { min: 0, max: 10, idleTimeoutMillis: 30000 },
    connectionTimeout: 15000,
    requestTimeout: 15000,
  };
}
