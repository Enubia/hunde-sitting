import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import type { DB } from './schema/db.js';

import { config } from '../config.js';

// import type { Database } from './types.ts'; // this is the Database interface we defined earlier

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            database: config.POSTGRES_DB,
            host: config.POSTGRES_HOST,
            user: config.POSTGRES_USER,
            password: config.POSTGRES_PASSWORD,
            port: config.POSTGRES_PORT,
            max: 10,
        }),
    }),
});
