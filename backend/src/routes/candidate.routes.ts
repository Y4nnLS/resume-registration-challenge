import { Router } from 'express';
import { createCandidateController } from '../controllers/candidate.controller.js';
import type { CandidateService } from '../services/candidate.service.js';

export function createCandidateRouter(service: CandidateService) {
  const router = Router();
  const controller = createCandidateController(service);
  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  return router;
}
