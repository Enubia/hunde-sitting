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

// Gracefully shutdown in development
// tsx causes to throw -> ELIFECYCLE Command failed with exit code 130.
// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV !== 'production') {
    process.on('SIGINT', () => {
        // eslint-disable-next-line no-console
        console.info('Shutting down');
        process.exit(0);
    });
}
