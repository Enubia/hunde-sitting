import type LoggerFactory from './logger/loggerfactory.js';

import { requestId } from 'hono/request-id';

import { generateRequestId } from '#shared/utils.js';

import createRouter from './create-router.js';

export default function createApp(logFunctions: ReturnType<LoggerFactory['createLogger']>) {
    const app = createRouter();

    app
        .use((c, next) => requestId({ generator: generateRequestId(c) })(c, next))
        .use((c, next) => {
            // can be passed into the services methods
            c.set('requestLog', logFunctions(c.get('requestId')));

            return next();
        })
        .use(
            '*',
            async (_c, next) => {
                // general middleware
                return next();
            },
        )
        .notFound((c) => {
            log.warn('Not Found', c.req.url);

            return c.json({
                error: 'Not Found',
            }, 404);
        })
        .onError((error, c) => {
            log.critical('Unexpected crash', error.stack);

            return c.json({
                error: 'Internal Server Error',
            }, 500);
        });

    return app;
}
