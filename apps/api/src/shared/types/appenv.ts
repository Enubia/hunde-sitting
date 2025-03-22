import type { Context, Hono } from 'hono';

import type LogManager from '#lib/logger/logmanager.js';

export type AppEnv = {
    Bindings: {
        PORT: number;
    };
    Variables: {
        requestLog: ReturnType<LogManager['buildRequestLogger']>;
    };
};

// eslint-disable-next-line ts/no-empty-object-type
export type MiddlewareContext = Context<AppEnv, string, {}>;

// eslint-disable-next-line ts/no-empty-object-type
export type AppAPI = Hono<AppEnv, {}>;
