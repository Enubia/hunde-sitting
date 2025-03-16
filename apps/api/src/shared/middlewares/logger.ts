import type { Context } from 'hono';

import type LoggerFactory from '#lib/logger/loggerfactory.js';

export function logFunction(c: Context, logFunctions: ReturnType<LoggerFactory['for']>) {
    return (...args: unknown[]) => {
        const id = c.get('requestId');

        c.set('log', logFunctions(id));

        c.get('log').info(...args);
    };
}
