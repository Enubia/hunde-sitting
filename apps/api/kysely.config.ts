import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl';

import { db } from './src/lib/db/database';

export default defineConfig({
    // replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
    kysely: db,
    migrations: {
        migrationFolder: 'src/lib/db/migrations',
        getMigrationPrefix: getKnexTimestampPrefix,
    },
    //   plugins: [],
    seeds: {
        seedFolder: 'src/lib/db/seeds',
    },
});
