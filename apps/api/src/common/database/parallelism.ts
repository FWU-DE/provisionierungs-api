export function getSpecifiedDatabasePoolSize(): number {
  return Number(process.env.DATABASE_POOL_SIZE ?? 10);
}
