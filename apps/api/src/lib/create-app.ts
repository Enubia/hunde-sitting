import { notFound, onError } from 'stoker/middlewares';

import createRouter from './create-router.js';

export default function createApp() {
    const app = createRouter();

    app
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
