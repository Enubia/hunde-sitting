import type { DashboardService } from './service.js';

import createRouter from '#lib/create-router.js';
import container from '#lib/ioc.js';

import { DashboardServiceSymbol } from './service.js';
import { dashboardQueryValidator } from './validator.js';

const dashboardService = container.get<DashboardService>(DashboardServiceSymbol);

const router = createRouter()
    .get('/', dashboardQueryValidator, async (c) => {
        const limit = c.req.query('limit');

        c.get('requestLog').info('Fetching dashboard data', { limit });

        const data = await dashboardService.getDashboardData(limit);

        return c.json({
            data,
        });
    });

export default router;
