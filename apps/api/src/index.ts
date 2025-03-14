import 'reflect-metadata';

import type { IDatabaseProvider } from './db/databaseprovider.js';

import { serve } from '@hono/node-server';

import { DatabaseProviderSymbol } from './db/databaseprovider.js';
import { config } from './lib/config.js';
import createApp from './lib/create-app.js';
import container from './lib/ioc.js';
import { registerRoutes } from './routes/index.js';

await container.get<IDatabaseProvider>(DatabaseProviderSymbol).connect();

const app = registerRoutes(createApp());

serve({
    fetch: app.fetch,
    port: config.PORT,
}, (info) => {
    // eslint-disable-next-line no-console
    console.info(`Listening on http://localhost:${info.port}`);
});
