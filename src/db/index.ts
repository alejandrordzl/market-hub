import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Optimize connection pool for better performance
  max: 20, // Maximum number of connections in the pool
  min: 5,  // Minimum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout for connection acquisition
  maxUses: 7500, // Close connections after 7500 uses to prevent memory leaks
});

export const db = drizzle(pool, { schema });

export default db;