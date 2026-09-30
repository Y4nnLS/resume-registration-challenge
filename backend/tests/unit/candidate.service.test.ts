import { describe, expect, it, vi } from 'vitest';
import type { Candidate } from '../../src/models/candidate.js';
import { createCandidateService } from '../../src/services/candidate.service.js';

const candidate: Candidate = {
  id: 1,
  fullName: 'Candidata Exemplo',
  email: 'candidata@example.com',
  phone: null,
  desiredPosition: null,
  professionalSummary: null,
  createdAt: '2026-09-30T12:00:00.000Z',
};

describe('candidate service', () => {
  it('delegates creation to the repository and returns its result', async () => {
    const repository = {
      create: vi.fn().mockResolvedValue(candidate),
      findAll: vi.fn(),
      findById: vi.fn(),
    };
    const data = {
      fullName: candidate.fullName,
      email: candidate.email,
      phone: null,
      desiredPosition: null,
      professionalSummary: null,
    };

    await expect(createCandidateService(repository).create(data)).resolves.toEqual(candidate);
    expect(repository.create).toHaveBeenCalledWith(data);
  });

  it('reports an absent candidate with the domain error', async () => {
    const service = createCandidateService({
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    });
    await expect(service.getById(10)).rejects.toMatchObject({
      status: 404,
      code: 'CANDIDATE_NOT_FOUND',
    });
  });
});
