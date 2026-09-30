import { expect, it } from 'vitest';
import { readDatabaseConfig } from '../../src/config/env.js';

it('uses TEST_DB settings exclusively and rejects unsafe or incomplete test configuration', () => {
  const environment = {
    DB_SERVER: 'development-host',
    DB_NAME: 'ResumeRegistration',
    DB_USER: 'development-user',
    DB_PASSWORD: 'development-password',
    TEST_DB_SERVER: 'test-host',
    TEST_DB_NAME: 'ResumeRegistration_test',
    TEST_DB_USER: 'test-user',
    TEST_DB_PASSWORD: 'test-password',
  };

  expect(readDatabaseConfig(environment, 'test')).toMatchObject({
    server: 'test-host',
    database: 'ResumeRegistration_test',
    user: 'test-user',
  });
  expect(() => readDatabaseConfig({ ...environment, TEST_DB_USER: undefined }, 'test')).toThrow(
    'TEST_DB',
  );
  expect(() =>
    readDatabaseConfig({ ...environment, TEST_DB_NAME: 'ResumeRegistration' }, 'test'),
  ).toThrow('_test');
});
