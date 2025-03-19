import type { Context } from 'hono';

import LoggerFactory from '#lib/logger/loggerfactory.js';

function determineLogLevel(c: Context, ...args: unknown[]) {
    const lastArg = args[args.length - 1];

    const status = new LoggerFactory().stripColorsFromMessage(lastArg as string);

    if (status.startsWith('4')) {
        c.get('log').warn(...args);
    }

    if (status.startsWith('5')) {
        c.get('log').error(...args);
    }

    c.get('log').info(...args);
}

export function logFunction(c: Context, logFunctions: ReturnType<LoggerFactory['for']>) {
    return (...args: unknown[]) => {
        const id = c.get('requestId');

        c.set('log', logFunctions(id));

        determineLogLevel(c, ...args);
    };
}
