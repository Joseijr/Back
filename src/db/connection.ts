import {drizzle} from "drizzle-orm/node-postgres";
import {Pool} from "pg";
import * as schema from "./schema";
import env from "../../env";

// Create a single pool instance (not a function that creates new pools)
// This ensures connection reuse and better performance
const pool = new Pool({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    max: 10, // Increased from 1 to 10 for better concurrent request handling
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    ssl: {
        rejectUnauthorized: false
    }
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });
export default db;