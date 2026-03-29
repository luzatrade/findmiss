function isPostgresUrl(value) {
  return typeof value === 'string' && value.startsWith('postgresql://');
}

function resolveDatabaseUrl() {
  const current = process.env.DATABASE_URL;
  const alternatives = [
    'DATABASE_PUBLIC_URL',
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'PG_DATABASE_URL',
    'RAILWAY_DATABASE_URL'
  ];

  if (isPostgresUrl(current) && current.includes('railway.internal')) {
    const firstReachableLike = alternatives.find((key) => isPostgresUrl(process.env[key]));
    if (firstReachableLike) {
      process.env.DATABASE_URL = process.env[firstReachableLike];
      process.env.DATABASE_URL_SOURCE = firstReachableLike;
      return;
    }
  }

  process.env.DATABASE_URL_SOURCE = process.env.DATABASE_URL_SOURCE || 'DATABASE_URL';
}

module.exports = { resolveDatabaseUrl };
