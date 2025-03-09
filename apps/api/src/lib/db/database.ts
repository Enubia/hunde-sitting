import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import type { DB } from './schema/db.js';

// DO NOT CHANGE THIS TO AN ALIAS IMPORT
// otherwise kysely-codegen can't execute the code
import { config } from '../config.js';

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
