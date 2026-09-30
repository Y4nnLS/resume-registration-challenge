import sql from 'mssql';
import type { Candidate } from '../models/candidate.js';
import type { CreateCandidateData } from '../validators/candidate.schema.js';

type CandidateRow = Omit<Candidate, 'createdAt'> & { createdAt: Date };
const toCandidate = (row: CandidateRow): Candidate => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

export function createCandidateRepository(pool: sql.ConnectionPool) {
  return {
    async create(data: CreateCandidateData): Promise<Candidate> {
      const result = await pool
        .request()
        .input('fullName', sql.NVarChar(150), data.fullName)
        .input('email', sql.NVarChar(254), data.email)
        .input('phone', sql.NVarChar(30), data.phone)
        .input('desiredPosition', sql.NVarChar(150), data.desiredPosition)
        .input('professionalSummary', sql.NVarChar(2000), data.professionalSummary)
        .query<CandidateRow>(`
          INSERT INTO dbo.Candidates (fullName, email, phone, desiredPosition, professionalSummary)
          OUTPUT INSERTED.id, INSERTED.fullName, INSERTED.email, INSERTED.phone,
                 INSERTED.desiredPosition, INSERTED.professionalSummary, INSERTED.createdAt
          VALUES (@fullName, @email, @phone, @desiredPosition, @professionalSummary)
        `);
      return toCandidate(result.recordset[0]);
    },
    async findAll(): Promise<Candidate[]> {
      const result = await pool.request().query<CandidateRow>(`
        SELECT id, fullName, email, phone, desiredPosition, professionalSummary, createdAt
        FROM dbo.Candidates ORDER BY createdAt DESC, id DESC
      `);
      return result.recordset.map(toCandidate);
    },
    async findById(id: number): Promise<Candidate | null> {
      const result = await pool.request().input('id', sql.Int, id).query<CandidateRow>(`
        SELECT id, fullName, email, phone, desiredPosition, professionalSummary, createdAt
        FROM dbo.Candidates WHERE id = @id
      `);
      return result.recordset[0] ? toCandidate(result.recordset[0]) : null;
    },
  };
}
export type CandidateRepository = ReturnType<typeof createCandidateRepository>;
