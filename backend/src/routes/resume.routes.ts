import multer from 'multer';
import { Router } from 'express';
import { createResumeController } from '../controllers/resume.controller.js';
import type { ResumeExtractionService } from '../services/resume-extraction.service.js';

export const maximumResumeSize = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maximumResumeSize, files: 1 },
});

export function createResumeRouter(service: ResumeExtractionService) {
  const router = Router();
  const controller = createResumeController(service);
  router.post('/extract', upload.single('file'), controller.extract);
  return router;
}
