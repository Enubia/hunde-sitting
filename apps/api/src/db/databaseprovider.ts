import type { Schema } from './schema/index.js';

import { injectable } from 'inversify';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { config } from '#lib/config.js';

export const DatabaseProviderSymbol = Symbol.for('DatabaseProvider');

@injectable()
export class DatabaseProvider {
    readonly db: Kysely<Schema>;
    constructor() {
        this.db = new Kysely<Schema>({
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
    }

    async close() {
        await this.db.destroy();
    }

    async connect() {
        const data = await this.db.introspection.getTables();
        const tables = data.filter(table => table.schema === 'public');
        // eslint-disable-next-line no-console
        console.info(`Database connected. Introspected tables: ${tables.length}`);
    }
}
