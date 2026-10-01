import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import type { ResumeExtraction } from '../models/resume-extraction.js';

const candidateEmailSchema = z.string().max(254).email();
const emailPattern = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+/gi;
const phonePattern = /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[\s-]?\d{4}/g;
const ignoredNameLines =
  /^(curr[ií]culo|curriculum vitae|resume|contato|objetivo|experi[eê]ncia|forma[cç][aã]o|habilidades|perfil profissional)$/i;
const nameWord = /^(?:[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ]+(?:[-'][A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ]+)*|da|das|de|do|dos|e)$/;

export function hasPdfSignature(buffer: Buffer) {
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

function extractEmail(text: string) {
  for (const match of text.matchAll(emailPattern)) {
    const email = match[0];
    if (candidateEmailSchema.safeParse(email).success) return email;
  }
  return null;
}

function extractPhone(text: string) {
  for (const match of text.matchAll(phonePattern)) {
    const digits = match[0].replace(/\D/g, '');
    const national = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
    if (national.length !== 10 && national.length !== 11) continue;
    const areaCode = national.slice(0, 2);
    const localNumber = national.slice(2);
    return localNumber.length === 9
      ? `(${areaCode}) ${localNumber.slice(0, 5)}-${localNumber.slice(5)}`
      : `(${areaCode}) ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`;
  }
  return null;
}

function isPlausibleName(line: string) {
  const normalized = line.trim().replace(/\s+/g, ' ');
  if (
    normalized.length > 150 ||
    ignoredNameLines.test(normalized) ||
    /[@:/]|\b(?:www\.|https?\b)/i.test(normalized)
  )
    return false;
  const words = normalized.split(' ');
  return (
    words.length >= 2 &&
    words.length <= 5 &&
    nameWord.test(words[0]) &&
    nameWord.test(words.at(-1) ?? '') &&
    words.every((word) => nameWord.test(word))
  );
}

function extractFullName(text: string) {
  return (
    text
      .split(/\r?\n/)
      .slice(0, 12)
      .find((line) => isPlausibleName(line))
      ?.trim()
      .replace(/\s+/g, ' ') ?? null
  );
}

export function extractResumeSuggestions(text: string): ResumeExtraction {
  return {
    fullName: extractFullName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
  };
}

export function createResumeExtractionService() {
  return {
    async extract(buffer: Buffer): Promise<ResumeExtraction> {
      const loadingTask = getDocument({ data: new Uint8Array(buffer) });
      try {
        const document = await loadingTask.promise;
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
          const page = await document.getPage(pageNumber);
          const content = await page.getTextContent();
          pages.push(
            content.items
              .map((item) => ('str' in item ? item.str : ''))
              .filter(Boolean)
              .join('\n'),
          );
          page.cleanup();
        }
        const text = pages.join('\n').trim();
        if (!text) {
          throw new AppError(422, 'PDF_TEXT_UNAVAILABLE', 'O PDF não contém texto utilizável.');
        }
        return extractResumeSuggestions(text);
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(422, 'INVALID_PDF', 'Não foi possível ler o PDF enviado.');
      } finally {
        await loadingTask.destroy();
      }
    },
  };
}

export type ResumeExtractionService = ReturnType<typeof createResumeExtractionService>;
