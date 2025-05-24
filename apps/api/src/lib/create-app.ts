import type LogManager from './logger/logmanager.js';

import { getConnInfo } from '@hono/node-server/conninfo';
import { requestId } from 'hono/request-id';

import { generateRequestId, preparePath } from '#shared/utils.js';

import createRouter from './create-router.js';

export default function createApp(logManager: LogManager) {
    const app = createRouter();

    app
        .use((c, next) => requestId({ generator: generateRequestId(c), headerName: 'x-request-identifier' })(c, next))
        .use(async (c, next) => {
            const startTime = Date.now();
            const connInfo = getConnInfo(c);
            const logFunctions = logManager.buildRequestLogger(c.get('requestId'));

            c.set('requestLog', logFunctions);

            await next();

            // eslint-disable-next-line style/max-len
            c.get('requestLog').info(`${c.res.status} ${c.req.method} ${preparePath(c)} - took ${Date.now() - startTime}ms ${connInfo.remote.address?.replace('::ffff:', '')}`);
        })
        .notFound((c) => {
            c.get('requestLog').warn('Not Found', preparePath(c));

            return c.json({
                error: 'Not Found',
            }, 404);
        })
        .onError((error, c) => {
            c.get('requestLog').critical('Unexpected crash', error.stack);

            return c.json({
                error: 'Internal Server Error',
            }, 500);
        });

    return app;
}
