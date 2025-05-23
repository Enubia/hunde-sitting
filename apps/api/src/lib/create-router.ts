import type { AppEnv } from '#shared/types/appenv.js';

import { Hono } from 'hono';

export default function createRouter(strict = false) {
    return new Hono<AppEnv>({
        strict,
    });
}
