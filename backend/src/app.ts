import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi.js';
import { AppError } from './errors/app-error.js';
import { errorHandler } from './middlewares/error-handler.js';
import { createCandidateRouter } from './routes/candidate.routes.js';
import type { CandidateService } from './services/candidate.service.js';

export function createApp(candidateService: CandidateService) {
  const app = express();
  app.use(express.json());
  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/candidates', createCandidateRouter(candidateService));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(() => {
    throw new AppError(404, 'NOT_FOUND', 'Recurso não encontrado.');
  });
  app.use(errorHandler);
  return app;
}
