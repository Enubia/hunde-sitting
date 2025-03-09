import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { config } from '#lib/config.js';

// import type { Database } from './types.ts'; // this is the Database interface we defined earlier

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.

// FIXME: This is a placeholder. Replace it with database structure.
// eslint-disable-next-line ts/no-empty-object-type
export const db = new Kysely<{}>({
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
