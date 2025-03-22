import type { Context, Hono } from 'hono';

import type LoggerProvider from '#lib/logger/loggerprovider.js';

export type AppEnv = {
    Bindings: {
        PORT: number;
    };
    Variables: {
        requestLog: ReturnType<LoggerProvider['applyLogLevel']>;
    };
};

// eslint-disable-next-line ts/no-empty-object-type
export type MiddlewareContext = Context<AppEnv, string, {}>;

// eslint-disable-next-line ts/no-empty-object-type
export type AppAPI = Hono<AppEnv, {}>;
