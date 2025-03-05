import { notFound, onError } from 'stoker/middlewares';

import type { AppOpenAPI } from './types.js';

import { BASE_PATH } from './constants.js';
import createRouter from './create-router.js';

export default function createApp() {
    const app = createRouter()
        .basePath(BASE_PATH) as AppOpenAPI;

    app
        .use(
            '*',
            async (_c, next) => {
                // c.set('authConfig', createAuthConfig(c.env));
                return next();
            },
        )
        // .use('/auth/*', authHandler())
        .notFound(notFound)
        .onError(onError);

    return app;
}
