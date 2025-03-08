/* eslint-disable node/no-process-env */
import { serve } from '@hono/node-server';
import { config } from 'dotenv';

import createApp from './lib/create-app.js';
import { registerRoutes } from './routes/index.js';

config();

const app = registerRoutes(createApp());

serve({
    fetch: app.fetch,
    port: Number.parseInt(process.env.PORT || '3000'),
}, (info) => {
    // eslint-disable-next-line no-console
    console.info(`Listening on http://localhost:${info.port}`);
});
