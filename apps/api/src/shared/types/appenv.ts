import type { Hono } from 'hono';

export type AppEnv = {
    Bindings: {
        PORT: number;
    };
    Variables: {
        log: {
            debug: (...args: unknown[]) => void;
            info: (...args: unknown[]) => void;
            warn: (...args: unknown[]) => void;
            error: (...args: unknown[]) => void;
            critical: (...args: unknown[]) => void;
        };
    };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppAPI = Hono<AppEnv, {}>;
