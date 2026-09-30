import { AppError } from '../errors/app-error.js';
import type { CandidateRepository } from '../repositories/candidate.repository.js';
import type { CreateCandidateData } from '../validators/candidate.schema.js';

export function createCandidateService(repository: CandidateRepository) {
  return {
    create: (data: CreateCandidateData) => repository.create(data),
    list: () => repository.findAll(),
    async getById(id: number) {
      const candidate = await repository.findById(id);
      if (!candidate) throw new AppError(404, 'CANDIDATE_NOT_FOUND', 'Candidato não encontrado.');
      return candidate;
    },
  };
}
export type CandidateService = ReturnType<typeof createCandidateService>;
