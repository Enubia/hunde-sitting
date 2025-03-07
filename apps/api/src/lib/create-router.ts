import { Hono } from 'hono';

import type { AppEnv } from './types.js';

export default function createRouter() {
    return new Hono<AppEnv>({
        strict: false,
    });
}
