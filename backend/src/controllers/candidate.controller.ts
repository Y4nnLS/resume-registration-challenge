import type { Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import type { CandidateService } from '../services/candidate.service.js';
import { candidateIdSchema, createCandidateSchema } from '../validators/candidate.schema.js';

export function createCandidateController(service: CandidateService) {
  return {
    async create(request: Request, response: Response) {
      const candidate = await service.create(createCandidateSchema.parse(request.body));
      response.location(`/api/candidates/${candidate.id}`).status(201).json(candidate);
    },
    async list(_request: Request, response: Response) {
      response.json(await service.list());
    },
    async getById(request: Request, response: Response) {
      const result = candidateIdSchema.safeParse(request.params.id);
      if (!result.success)
        throw new AppError(400, 'INVALID_ID', 'Informe um ID inteiro entre 1 e 2147483647.');
      response.json(await service.getById(result.data));
    },
  };
}
