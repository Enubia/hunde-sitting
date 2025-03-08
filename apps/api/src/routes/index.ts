import type { Hono } from 'hono';

import type { AppEnv } from '#lib/types.js';

import createApp from '#lib/create-app.js';

import index from './index.route.js';

export function registerRoutes(app: Hono<AppEnv>) {
    return app
        .route('/', index);
}

// stand alone router type used for api client
export const router = registerRoutes(
    createApp(),
);
// eslint-disable-next-line ts/no-redeclare
export type router = typeof router;
