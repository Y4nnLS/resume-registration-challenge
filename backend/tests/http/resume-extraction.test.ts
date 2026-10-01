import { readFile } from 'node:fs/promises';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.js';
import { maximumResumeSize } from '../../src/routes/resume.routes.js';
import { createCandidateService } from '../../src/services/candidate.service.js';
import { createResumeExtractionService } from '../../src/services/resume-extraction.service.js';

const app = createApp(
  createCandidateService({ create: vi.fn(), findAll: vi.fn(), findById: vi.fn() }),
  createResumeExtractionService(),
);
const readSampleResume = () =>
  readFile(new URL('../../../samples/sample-resume.pdf', import.meta.url));

describe('resume extraction HTTP API', () => {
  it('accepts a PDF of exactly 5 MiB and returns suggestions', async () => {
    const sample = await readSampleResume();
    const exactLimitPdf = Buffer.concat([sample, Buffer.alloc(maximumResumeSize - sample.length)]);
    const response = await request(app)
      .post('/api/resumes/extract')
      .attach('file', exactLimitPdf, { contentType: 'application/pdf', filename: 'resume.pdf' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      fullName: 'Marina Ficticia da Silva',
      email: 'marina.ficticia@example.com',
      phone: '(41) 99999-1234',
    });
  });

  it('requires the file field', async () => {
    const response = await request(app).post('/api/resumes/extract').field('note', 'sem arquivo');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('RESUME_FILE_REQUIRED');
  });

  it('rejects bytes without the PDF signature even when their MIME type claims PDF', async () => {
    const response = await request(app)
      .post('/api/resumes/extract')
      .attach('file', Buffer.from('não é um PDF'), {
        contentType: 'application/pdf',
        filename: 'arquivo.pdf',
      });

    expect(response.status).toBe(415);
    expect(response.body.error.code).toBe('UNSUPPORTED_FILE_TYPE');
  });

  it('rejects a file larger than 5 MiB', async () => {
    const response = await request(app)
      .post('/api/resumes/extract')
      .attach('file', Buffer.alloc(maximumResumeSize + 1), {
        contentType: 'application/pdf',
        filename: 'grande.pdf',
      });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
