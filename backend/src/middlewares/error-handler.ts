import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos.',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
        })),
      },
    });
    return;
  }
  if (error instanceof AppError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  // Normalize Express JSON parser failures without exposing the original body or message.
  if (error instanceof Error && 'type' in error) {
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({ error: { code: 'INVALID_JSON', message: 'JSON inválido.' } });
      return;
    }
    if (error.type === 'entity.too.large') {
      response
        .status(413)
        .json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Requisição muito grande.' } });
      return;
    }
    if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
      response
        .status(415)
        .json({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Codificação não suportada.' } });
      return;
    }
  }
  console.error(
    'Unexpected request failure. Check database availability and application configuration.',
  );
  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Não foi possível concluir a operação. Tente novamente.',
    },
  });
};
