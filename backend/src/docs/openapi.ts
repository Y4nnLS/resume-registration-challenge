const candidateInputProperties = {
  fullName: { type: 'string', minLength: 1, maxLength: 150, example: 'Candidata Exemplo' },
  email: { type: 'string', format: 'email', maxLength: 254, example: 'candidata@example.com' },
  phone: { type: 'string', nullable: true, maxLength: 30 },
  desiredPosition: { type: 'string', nullable: true, maxLength: 150 },
  professionalSummary: { type: 'string', nullable: true, maxLength: 2000 },
};
const candidateSchema = { $ref: '#/components/schemas/Candidate' };
const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
});

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Candidate API',
    version: '0.1.0',
    description:
      'Cadastro e consulta de candidatos. Valores de texto são aparados nas extremidades; opcionais ausentes, nulos ou vazios retornam null. E-mails podem se repetir.',
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/candidates': {
      post: {
        summary: 'Cadastrar candidato',
        operationId: 'createCandidate',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateCandidateRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Candidato criado.',
            headers: {
              Location: { description: 'URL relativa do candidato.', schema: { type: 'string' } },
            },
            content: { 'application/json': { schema: candidateSchema } },
          },
          '400': errorResponse(
            'Dados inválidos (VALIDATION_ERROR) ou JSON malformado (INVALID_JSON).',
          ),
          '500': errorResponse('Falha interna (INTERNAL_ERROR).'),
        },
      },
      get: {
        summary: 'Listar candidatos',
        operationId: 'listCandidates',
        description:
          'Sem paginação. Ordenação: createdAt DESC, id DESC. Retorna [] quando não há candidatos.',
        responses: {
          '200': {
            description: 'Candidatos cadastrados.',
            content: { 'application/json': { schema: { type: 'array', items: candidateSchema } } },
          },
          '500': errorResponse('Falha interna (INTERNAL_ERROR).'),
        },
      },
    },
    '/api/candidates/{id}': {
      get: {
        summary: 'Consultar candidato',
        operationId: 'getCandidate',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Inteiro decimal positivo, sem zeros à esquerda.',
            schema: { type: 'integer', format: 'int32', minimum: 1, maximum: 2147483647 },
          },
        ],
        responses: {
          '200': {
            description: 'Candidato encontrado.',
            content: { 'application/json': { schema: candidateSchema } },
          },
          '400': errorResponse('Identificador inválido (INVALID_ID).'),
          '404': errorResponse('Candidato não encontrado (CANDIDATE_NOT_FOUND).'),
          '500': errorResponse('Falha interna (INTERNAL_ERROR).'),
        },
      },
    },
    '/api/resumes/extract': {
      post: {
        summary: 'Extrair sugestões de um currículo PDF',
        operationId: 'extractResume',
        description:
          'Processa um único PDF em memória, sem persistir o arquivo ou criar candidatos. Não há OCR; campos sem sugestão retornam null.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF de até 5 MiB (5 * 1024 * 1024 bytes).',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sugestões extraídas do PDF.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ResumeExtraction' } },
            },
          },
          '400': errorResponse('Arquivo obrigatório ausente ou upload inválido.'),
          '413': errorResponse('Arquivo maior que 5 MiB (PAYLOAD_TOO_LARGE).'),
          '415': errorResponse('Mídia ou conteúdo diferente de PDF.'),
          '422': errorResponse(
            'PDF ilegível (INVALID_PDF) ou sem texto utilizável (PDF_TEXT_UNAVAILABLE).',
          ),
          '500': errorResponse('Falha interna (INTERNAL_ERROR).'),
        },
      },
    },
  },
  components: {
    schemas: {
      CreateCandidateRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['fullName', 'email'],
        properties: candidateInputProperties,
      },
      Candidate: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'fullName',
          'email',
          'phone',
          'desiredPosition',
          'professionalSummary',
          'createdAt',
        ],
        properties: {
          ...candidateInputProperties,
          id: { type: 'integer', format: 'int32', minimum: 1 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-30T12:00:00.000Z' },
        },
      },
      ResumeExtraction: {
        type: 'object',
        additionalProperties: false,
        required: ['fullName', 'email', 'phone'],
        properties: {
          fullName: { type: 'string', nullable: true, maxLength: 150 },
          email: { type: 'string', nullable: true, format: 'email', maxLength: 254 },
          phone: { type: 'string', nullable: true, maxLength: 30 },
        },
      },
      ApiError: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Dados inválidos.' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['field', 'message'],
                  properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'Informe um e-mail válido.' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
