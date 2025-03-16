import type { DashboardService } from './dashboardservice.js';

import createRouter from '#lib/create-router.js';
import container from '#lib/ioc.js';

import { DashboardServiceSymbol } from './dashboardservice.js';

const dashboardService = container.get<DashboardService>(DashboardServiceSymbol);

const router = createRouter()
    .get('/', async (c) => {
        const limit = c.req.query('limit');

        if (limit && Number.isNaN(limit)) {
            return c.json({
                error: 'Invalid limit',
            }, 400);
        }

        const data = await dashboardService.getDashboardData(limit);

        return c.json({
            data,
        });
    });

export default router;
