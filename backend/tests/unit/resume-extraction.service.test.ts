import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  createResumeExtractionService,
  extractResumeSuggestions,
} from '../../src/services/resume-extraction.service.js';

const readSampleResume = () =>
  readFile(new URL('../../../samples/sample-resume.pdf', import.meta.url));
const blankPdf = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 0 >>
stream

endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000219 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
268
%%EOF
`);

describe('resume extraction service', () => {
  it('extracts all suggestions from the fictitious text-based PDF', async () => {
    await expect(
      createResumeExtractionService().extract(await readSampleResume()),
    ).resolves.toEqual({
      fullName: 'Marina Ficticia da Silva',
      email: 'marina.ficticia@example.com',
      phone: '(41) 99999-1234',
    });
  });

  it('extracts a plausible email only when it passes the candidate-compatible rule', () => {
    expect(extractResumeSuggestions('Contato: invalido@ e maria@example.com').email).toBe(
      'maria@example.com',
    );
  });

  it('normalizes a Brazilian phone number', () => {
    expect(extractResumeSuggestions('Telefone: +55 (41) 99999-1234').phone).toBe('(41) 99999-1234');
  });

  it('suggests a likely name near the beginning while ignoring headings and contact lines', () => {
    expect(
      extractResumeSuggestions('CURRÍCULO\nmarina.ficticia@example.com\nMarina Ficticia da Silva')
        .fullName,
    ).toBe('Marina Ficticia da Silva');
  });

  it('returns null suggestions when usable text has no candidate fields', () => {
    expect(extractResumeSuggestions('Perfil profissional\nExperiência em atendimento.')).toEqual({
      fullName: null,
      email: null,
      phone: null,
    });
  });

  it('reports a valid PDF with no usable text', async () => {
    await expect(createResumeExtractionService().extract(blankPdf)).rejects.toMatchObject({
      status: 422,
      code: 'PDF_TEXT_UNAVAILABLE',
    });
  });
});
