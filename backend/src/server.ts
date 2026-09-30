import { app } from './app.js';

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');
  process.exit(1);
}

const server = app.listen(port, '127.0.0.1', (error) => {
  if (!error) {
    console.info(`Backend listening at http://127.0.0.1:${port}`);
  }
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(
    `Unable to start the backend (${error.code ?? 'UNKNOWN'}). Check PORT availability.`,
  );
  process.exit(1);
});
