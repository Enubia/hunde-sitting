import type { Hono } from 'hono';

import type { AppEnv } from '#shared/types/appenv.js';

import admincontroller from '#admin/admincontroller.js';

export function registerRoutes(app: Hono<AppEnv>) {
    return app
        .route('/admin', admincontroller)
        .get('/health', (c) => {
            return c.json({
                status: 'ok',
            });
        });
}
