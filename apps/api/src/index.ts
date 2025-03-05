import { serve } from '@hono/node-server';

import configureOpenAPI from './lib/configure-open-api.js';
import createApp from './lib/create-app.js';
import { registerRoutes } from './routes/index.js';

const app = registerRoutes(createApp());
configureOpenAPI(app);

serve({
    fetch: app.fetch,
    port: 3000,
});
