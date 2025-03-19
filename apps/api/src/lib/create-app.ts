import type LoggerFactory from './logger/loggerfactory.js';

import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';

import { logFunction } from '#shared/middlewares/index.js';
import { generateRequestId } from '#shared/utils.js';

import createRouter from './create-router.js';

export default function createApp(logFunctions: ReturnType<LoggerFactory['for']>) {
    const app = createRouter();

    app
        .use((c, next) => requestId({ generator: generateRequestId(c) })(c, next))
        .use((c, next) => {
            return logger(logFunction(c, logFunctions))(c, next);
        })
        .use(
            '*',
            async (_c, next) => {
                // general middleware
                return next();
            },
        )
        .notFound((c) => {
            return c.json({
                error: 'Not Found',
            }, 404);
        })
        .onError((error, c) => {
            log.critical(error);

            return c.json({
                error: 'Internal Server Error',
            }, 500);
        });

    return app;
}
