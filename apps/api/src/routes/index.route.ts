import * as HttpStatusCodes from 'stoker/http-status-codes';

import createRouter from '#lib/create-router.js';

const router = createRouter()
    .get('/', (c) => {
        return c.json({
            message: 'Hunde-Sitting API',
        }, HttpStatusCodes.OK);
    });

export default router;
