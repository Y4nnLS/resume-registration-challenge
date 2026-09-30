import sql from 'mssql';

export function createDatabasePool(configuration: sql.config): sql.ConnectionPool {
  const pool = new sql.ConnectionPool(configuration);
  pool.on('error', () => {
    console.error('SQL Server connection pool failure. Check database availability.');
  });
  return pool;
}
