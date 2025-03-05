import type { AppOpenAPI } from '../lib/types.js';

import { BASE_PATH } from '../lib/constants.js';
import createRouter from '../lib/create-router.js';
import index from './index.route.js';

export function registerRoutes(app: AppOpenAPI) {
    return app
        .route('/', index);
}

// stand alone router type used for api client
export const router = registerRoutes(
    createRouter().basePath(BASE_PATH),
);
// eslint-disable-next-line ts/no-redeclare
export type router = typeof router;
