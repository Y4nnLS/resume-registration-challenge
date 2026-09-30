SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- The lock prevents simultaneous seed runs from both observing an empty table.
IF NOT EXISTS (SELECT 1 FROM dbo.Candidates WITH (TABLOCKX, HOLDLOCK))
BEGIN
    INSERT INTO dbo.Candidates (fullName, email, phone, desiredPosition, professionalSummary)
    VALUES
        (N'Candidata Exemplo Alfa', N'candidata.alfa@example.com', NULL, N'Desenvolvimento backend', N'Perfil fictício para demonstração da aplicação.'),
        (N'Candidato Exemplo Beta', N'candidato.beta@example.com', NULL, N'Desenvolvimento frontend', N'Dados inteiramente fictícios para testes locais.'),
        (N'Candidata Exemplo Gama', N'candidata.gama@example.com', NULL, NULL, NULL);
    SELECT N'inserted' AS status;
END
ELSE
    SELECT N'skipped: Candidates is not empty' AS status;

COMMIT TRANSACTION;
