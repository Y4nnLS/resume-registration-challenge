import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.js';
import type { Candidate } from '../../src/models/candidate.js';
import { createCandidateService } from '../../src/services/candidate.service.js';
import { createResumeExtractionService } from '../../src/services/resume-extraction.service.js';

const candidate: Candidate = {
  id: 1,
  fullName: 'Candidata Exemplo',
  email: 'candidata@example.com',
  phone: null,
  desiredPosition: null,
  professionalSummary: null,
  createdAt: '2026-09-30T12:00:00.000Z',
};
const repository = { create: vi.fn(), findAll: vi.fn(), findById: vi.fn() };
const app = createApp(createCandidateService(repository), createResumeExtractionService());

beforeEach(() => {
  vi.resetAllMocks();
  repository.create.mockResolvedValue(candidate);
  repository.findAll.mockResolvedValue([candidate]);
  repository.findById.mockResolvedValue(candidate);
});

describe('candidate HTTP API', () => {
  it('creates a candidate', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .send({ fullName: candidate.fullName, email: candidate.email });

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe('/api/candidates/1');
    expect(response.body).toEqual(candidate);
  });

  it('rejects invalid candidate input', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .send({ fullName: '', email: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('lists candidates', async () => {
    expect((await request(app).get('/api/candidates')).body).toEqual([candidate]);
  });

  it('returns candidate details', async () => {
    expect((await request(app).get('/api/candidates/1')).body).toEqual(candidate);
  });

  it('rejects an invalid identifier', async () => {
    const response = await request(app).get('/api/candidates/not-an-id');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ID');
  });

  it('returns not found for an absent candidate', async () => {
    repository.findById.mockResolvedValue(null);
    const response = await request(app).get('/api/candidates/1');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('CANDIDATE_NOT_FOUND');
  });
});
