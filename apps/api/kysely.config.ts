import type { IDatabaseProvider } from './src/db/databaseprovider';

import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl';

import { DatabaseProviderSymbol } from './src/db/databaseprovider';
import container from './src/ioc';

export default defineConfig({
    kysely: container.get<IDatabaseProvider>(DatabaseProviderSymbol).db,
    migrations: {
        migrationFolder: 'src/db/migrations',
        getMigrationPrefix: getKnexTimestampPrefix,
    },
    //   plugins: [],
    seeds: {
        seedFolder: 'src/db/seeds',
    },
});
