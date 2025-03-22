import type { Hono } from 'hono';

import type { AppEnv } from '#shared/types/appenv.js';

import admincontroller from '#routes/admin/admin.router.js';

export function registerRoutes(app: Hono<AppEnv>) {
    return app
        .route('/admin', admincontroller)
        .get('/health', (c) => {
            return c.json({
                status: 'ok',
            });
        });
}
