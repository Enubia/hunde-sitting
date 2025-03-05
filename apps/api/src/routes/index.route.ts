import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

import createRouter from '../lib/create-router.js';

const router = createRouter()
    .openapi(
        createRoute({
            tags: ['Index'],
            method: 'get',
            path: '/',
            responses: {
                [HttpStatusCodes.OK]: jsonContent(
                    createMessageObjectSchema('Hunde-Sitting API'),
                    'Hunde-Sitting API',
                ),
            },
        }),
        (c) => {
            return c.json({
                message: 'Hunde-Sitting API',
            }, HttpStatusCodes.OK);
        },
    );

export default router;
