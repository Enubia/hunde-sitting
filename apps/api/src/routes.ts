import type { Hono } from 'hono';

import type { AppEnv } from '#shared/types/appenv.js';

import admin from '#routes/admin/admin.router.js';

export function registerRoutes(app: Hono<AppEnv>) {
    return app
        .route('/admin', admin)
        .get('/health', (c) => {
            return c.json({
                status: 'ok',
            });
        });
}
