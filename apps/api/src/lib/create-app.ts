import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { notFound, onError } from 'stoker/middlewares';

import createRouter from './create-router.js';
import logFunction from './logger.js';
import { generateRequestId } from './utils.js';

export default function createApp() {
    const app = createRouter();

    app
        .use((c, next) => requestId({ generator: generateRequestId(c) })(c, next))
        .use((c, next) => {
            return logger(logFunction(c))(c, next);
        })
        .use(
            '*',
            async (_c, next) => {
                // general middleware
                return next();
            },
        )
        .notFound(notFound)
        .onError(onError);

    return app;
}
