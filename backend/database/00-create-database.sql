-- Run in SSMS with a login allowed to create databases.
-- For the integration environment, change only this value to ResumeRegistration_test.
USE master;
DECLARE @databaseName sysname = N'ResumeRegistration';
IF DB_ID(@databaseName) IS NULL
BEGIN
    DECLARE @statement nvarchar(max) = N'CREATE DATABASE ' + QUOTENAME(@databaseName);
    EXEC sys.sp_executesql @statement;
END;
