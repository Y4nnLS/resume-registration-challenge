import { createApp } from './app.js';
import { createDatabasePool } from './config/database.js';
import { readDatabaseConfig, readPort } from './config/env.js';
import { createCandidateRepository } from './repositories/candidate.repository.js';
import { createCandidateService } from './services/candidate.service.js';

async function startServer() {
  const port = readPort();
  const pool = createDatabasePool(readDatabaseConfig());
  try {
    await pool.connect();
    const app = createApp(createCandidateService(createCandidateRepository(pool)));
    const server = app.listen(port, '127.0.0.1', (error) => {
      if (!error) console.info(`Backend listening at http://127.0.0.1:${port}`);
    });
    server.on('error', () => {
      console.error('Unable to start HTTP server. Check PORT availability.');
      void pool
        .close()
        .catch(() => console.error('Unable to close the database pool.'))
        .finally(() => {
          process.exitCode = 1;
        });
    });
    const shutdown = () => {
      server.close(() => {
        void pool.close().catch(() => {
          console.error('Unable to close the database pool.');
          process.exitCode = 1;
        });
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    await pool.close();
    throw error;
  }
}

startServer().catch(() => {
  console.error(
    'Unable to start backend. Check PORT, DB_* configuration and SQL Server availability.',
  );
  process.exitCode = 1;
});
