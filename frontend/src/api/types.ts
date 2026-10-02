export type Candidate = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  desiredPosition: string | null;
  professionalSummary: string | null;
  createdAt: string;
};

export type CreateCandidateInput = Omit<Candidate, 'id' | 'createdAt'>;

export type ResumeExtraction = Pick<Candidate, 'fullName' | 'email' | 'phone'>;

export type ApiErrorDetail = {
  field: string;
  message: string;
};

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}
