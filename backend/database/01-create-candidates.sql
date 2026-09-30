SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Candidates', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Candidates (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Candidates PRIMARY KEY,
        fullName NVARCHAR(150) NOT NULL,
        email NVARCHAR(254) NOT NULL,
        phone NVARCHAR(30) NULL,
        desiredPosition NVARCHAR(150) NULL,
        professionalSummary NVARCHAR(2000) NULL,
        createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_Candidates_createdAt DEFAULT SYSUTCDATETIME()
    );
END;

COMMIT TRANSACTION;
