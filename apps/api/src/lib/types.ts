import type { Hono } from 'hono';

export type AppEnv = {
    Bindings: {
        PORT: number;
    };
    Variables: {
        log: {
            debug: (...message: string[]) => void;
            info: (...message: string[]) => void;
            warn: (...message: string[]) => void;
            error: (...message: string[]) => void;
            critical: (...message: string[]) => void;
        };
    };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppAPI = Hono<AppEnv, {}>;
