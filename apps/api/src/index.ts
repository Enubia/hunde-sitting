import 'reflect-metadata';

import type { DatabaseProvider } from './db/databaseprovider.js';

import { serve } from '@hono/node-server';

import { DatabaseProviderSymbol } from './db/databaseprovider.js';
import { config } from './lib/config.js';
import createApp from './lib/create-app.js';
import container from './lib/ioc.js';
import { registerRoutes } from './registerroutes.js';

await container.get<DatabaseProvider>(DatabaseProviderSymbol).connect();

const app = registerRoutes(createApp());

serve({
    fetch: app.fetch,
    port: config.PORT,
}, (info) => {
    // eslint-disable-next-line no-console
    console.info(`Listening on http://localhost:${info.port}`);
});
