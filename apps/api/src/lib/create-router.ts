import type { AppEnv } from '../types/index.js';

import { Hono } from 'hono';

export default function createRouter(strict = false) {
    return new Hono<AppEnv>({
        strict,
    });
}
