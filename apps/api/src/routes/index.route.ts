import * as HttpStatusCodes from 'stoker/http-status-codes';

import createRouter from '#lib/create-router.js';
import { indexQueryValidator } from '#lib/validators/index.js';

const router = createRouter()
    .get('/', indexQueryValidator, (c) => {
        const query = c.req.valid('query');

        c.get('log').info('Query:', query);

        return c.json({
            message: 'Hunde-Sitting API',
        }, HttpStatusCodes.OK);
    });

export default router;
