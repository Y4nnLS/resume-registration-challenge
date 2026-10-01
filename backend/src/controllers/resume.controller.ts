import type { Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { hasPdfSignature } from '../services/resume-extraction.service.js';
import type { ResumeExtractionService } from '../services/resume-extraction.service.js';

export function createResumeController(service: ResumeExtractionService) {
  return {
    async extract(request: Request, response: Response) {
      if (!request.is('multipart/form-data')) {
        throw new AppError(
          415,
          'UNSUPPORTED_MEDIA_TYPE',
          'Envie um arquivo PDF em multipart/form-data.',
        );
      }
      if (!request.file) {
        throw new AppError(400, 'RESUME_FILE_REQUIRED', 'Envie um arquivo PDF no campo file.');
      }
      if (request.file.mimetype !== 'application/pdf' || !hasPdfSignature(request.file.buffer)) {
        throw new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'Envie um arquivo PDF válido.');
      }
      response.json(await service.extract(request.file.buffer));
    },
  };
}
