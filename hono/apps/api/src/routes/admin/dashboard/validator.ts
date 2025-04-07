import type { MiddlewareContext } from '#shared/types/appenv.js';

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const dashboardQuerySchema = z.object({
    page: z.number({ coerce: true }).int().positive(),
    limit: z.number({ coerce: true }).int().positive(),
});

export const dashboardQueryValidator = zValidator('query', dashboardQuerySchema, (result, c: MiddlewareContext) => {
    if (!result.success) {
        for (const error of result.error.errors) {
            c.get('requestLog').error('Invalid query', error.message);
        }
    }
});
