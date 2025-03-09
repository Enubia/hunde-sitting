import type { Hono } from 'hono';

import type { AppEnv } from '#lib/types.js';

import admin from './admin.route.js';
import index from './index.route.js';

export function registerRoutes(app: Hono<AppEnv>) {
    return app
        .route('/', index)
        .route('/admin', admin)
        .get('/health', (c) => {
            return c.json({
                status: 'ok',
            });
        });
}
