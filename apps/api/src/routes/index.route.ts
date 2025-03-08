import * as HttpStatusCodes from 'stoker/http-status-codes';

import createRouter from '#lib/create-router.js';

const router = createRouter()
    .get('/', (c) => {
        c.get('log').debug('pupu kaka');
        c.get('log').info('pupu kaka');
        c.get('log').warn('pupu kaka');
        c.get('log').error('pupu kaka');
        c.get('log').critical('pupu kaka');
        return c.json({
            message: 'Hunde-Sitting API',
        }, HttpStatusCodes.OK);
    });

export default router;
