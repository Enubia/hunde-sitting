import { Hono } from 'hono';

import type { AppEnv } from './types.js';

export default function createRouter(strict = false) {
    return new Hono<AppEnv>({
        strict,
    });
}
