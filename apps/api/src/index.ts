import { serve } from '@hono/node-server';

import createApp from './lib/create-app.js';
import { registerRoutes } from './routes/index.js';

const app = registerRoutes(createApp());

serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    // eslint-disable-next-line no-console
    console.info(`Listening on http://localhost:${info.port}`);
});
