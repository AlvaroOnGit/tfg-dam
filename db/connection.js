/**
 * Handles the PostgresSQL database connection.
 * Creates a connection pool depending on the environment
 * (production or local development).
 */

import { Pool } from 'pg';

let pool;

/**
 * PostgresSQL connection pool used to run database queries.
 *
 * @type {import('pg').Pool}
 */
if (process.env.NODE_ENV === 'production') {
    pool = new Pool({
        connectionString: process.env.PG_URL,
        ssl: { rejectUnauthorized: false }
    })
}
else {
    pool = new Pool({
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        database: process.env.PG_DB,
    });
}

export default pool;