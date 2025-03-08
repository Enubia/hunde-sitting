import type { Hono } from 'hono';

import type { AppEnv } from '#lib/types.js';

import createApp from '#lib/create-app.js';

import admin from './admin.route.js';
import index from './index.route.js';

export function registerRoutes(app: Hono<AppEnv>) {
    return app
        .route('/', index)
        .route('/admin', admin);
}

// stand alone router type used for api client
export const router = registerRoutes(createApp());
export type Router = typeof router;
