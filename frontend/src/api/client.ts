import {
  ApiRequestError,
  type ApiErrorDetail,
  type Candidate,
  type CreateCandidateInput,
  type ResumeExtraction,
} from './types';

type ErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ field?: string; message?: string }>;
  };
};

function isErrorResponse(value: unknown): value is ErrorResponse {
  return typeof value === 'object' && value !== null && 'error' in value;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Não foi possível conectar ao servidor.');
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (
      isErrorResponse(payload) &&
      typeof payload.error?.code === 'string' &&
      typeof payload.error.message === 'string'
    ) {
      const details = (payload.error.details ?? []).reduce<ApiErrorDetail[]>((result, detail) => {
        if (typeof detail.field === 'string' && typeof detail.message === 'string') {
          result.push({ field: detail.field, message: detail.message });
        }
        return result;
      }, []);
      throw new ApiRequestError(
        response.status,
        payload.error.code,
        payload.error.message,
        details,
      );
    }

    throw new ApiRequestError(
      response.status,
      'REQUEST_FAILED',
      'Não foi possível concluir a solicitação.',
    );
  }

  return payload as T;
}

export function createCandidate(input: CreateCandidateInput) {
  return request<Candidate>('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function listCandidates() {
  return request<Candidate[]>('/api/candidates');
}

export function getCandidate(id: string) {
  return request<Candidate>('/api/candidates/' + id);
}

export function extractResume(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<ResumeExtraction>('/api/resumes/extract', { method: 'POST', body: formData });
}
