import type { DB } from './schema.js';

import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { config } from '../lib/config.js';

/**
 * This export exists solely to provdie a connection to the database for the migrator.
 * Migrator cli cannot handle path aliases and I don't want to change them just for this.
 */
export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new pg.Pool({
            database: config.POSTGRES_DB,
            host: config.POSTGRES_HOST,
            user: config.POSTGRES_USER,
            password: config.POSTGRES_PASSWORD,
            port: config.POSTGRES_PORT,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 30000,
            max: 5,
        }),
    }),
});
