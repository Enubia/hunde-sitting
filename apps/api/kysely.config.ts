import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl';

import { db } from './src/db/migratorconnection.js';

export default defineConfig({
    kysely: db,
    migrations: {
        migrationFolder: 'src/db/migrations',
        getMigrationPrefix: getKnexTimestampPrefix,
    },
    //   plugins: [],
    seeds: {
        seedFolder: 'src/db/seeds',
    },
});
