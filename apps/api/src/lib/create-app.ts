import type LoggerFactory from './logger/loggerfactory.js';

import { getConnInfo } from '@hono/node-server/conninfo';
import { requestId } from 'hono/request-id';

import { generateRequestId, preparePath } from '#shared/utils.js';

import createRouter from './create-router.js';

export default function createApp(logFunctions: ReturnType<LoggerFactory['createLogger']>) {
    const app = createRouter();

    app
        .use((c, next) => requestId({ generator: generateRequestId(c), headerName: 'x-request-identifier' })(c, next))
        .use(async (c, next) => {
            const startTime = Date.now();
            const connInfo = getConnInfo(c);

            // can be passed into the services methods
            c.set('requestLog', logFunctions(c.get('requestId')));

            await next();

            c.get('requestLog').info(`${c.res.status} ${c.req.method} ${preparePath(c)} - took ${Date.now() - startTime}ms ${connInfo.remote.address?.replace('::ffff:', '')}`);
        })
        // .use(
        //     '*',
        //     async (_c, next) => {
        //         // general middleware
        //         return next();
        //     },
        // )
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
