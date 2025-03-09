import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const indexQuerySchema = z.object({
    page: z.number({ coerce: true }).int().positive(),
    limit: z.number({ coerce: true }).int().positive(),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});

export const indexQueryValidator = zValidator('query', indexQuerySchema);
