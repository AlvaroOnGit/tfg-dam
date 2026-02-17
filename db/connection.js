/**
 * Handles the connection to the database
 */
import { Pool } from 'pg';

const isProduction = false;

let pool;

if (isProduction) {
    //cloud connection
    pool = new Pool({
        connectionString: process.env.PG_URL,
        ssl: { rejectUnauthorized: false }
    })
}
else {
    //local connection
    pool = new Pool({
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        database: process.env.PG_DB,
    });
}

//Testing
//pool.connect()
//    .then(() => console.log(`Successfully connected to the database`))
//    .catch(err => console.error('Error connecting to the database', err));

export default pool;