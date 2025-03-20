import type { DashboardService } from './dashboardservice.js';

import createRouter from '#lib/create-router.js';
import container from '#lib/ioc.js';

import { dashboardQueryValidator } from './dashboard.validator.js';
import { DashboardServiceSymbol } from './dashboardservice.js';

const dashboardService = container.get<DashboardService>(DashboardServiceSymbol);

const router = createRouter()
    .get('/', dashboardQueryValidator, async (c) => {
        const limit = c.req.query('limit');

        try {
            log.debug('Getting dashboard data', { limit });
        } catch (error) {
            console.error('Error in logging', error);
        }

        const data = await dashboardService.getDashboardData(limit);

        return c.json({
            data,
        });
    });

export default router;
