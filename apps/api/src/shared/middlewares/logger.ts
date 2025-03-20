import type { Context } from 'hono';

import LoggerFactory from '#lib/logger/loggerfactory.js';

function determineLogLevel(c: Context, ...args: unknown[]) {
    const lastArg = args[args.length - 1];

    const status = new LoggerFactory().stripColorsFromMessage(lastArg as string);

    try {
        if (status.startsWith('4')) {
            c.get('requestLog').warn(...args);
        }

        if (status.startsWith('5')) {
            c.get('requestLog').error(...args);
        }

        c.get('requestLog').info(...args);
    } catch (error) {
        console.error('Error in logging', error);
    }
}

export function logFunction(c: Context, logFunctions: ReturnType<LoggerFactory['for']>) {
    return (...args: unknown[]) => {
        const id = c.get('requestId');

        try {
            c.set('requestLog', logFunctions(id));
            determineLogLevel(c, ...args);
        } catch (error) {
            console.error('Error in logging', error);
        }
    };
}
