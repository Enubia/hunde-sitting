import type { Hono } from 'hono';

export type AppEnv = {
    Bindings: {
        PORT: number;
    };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppAPI = Hono<AppEnv, {}>;
