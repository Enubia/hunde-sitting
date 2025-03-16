import 'reflect-metadata';

import type { DatabaseProvider } from './db/databaseprovider.js';

import { serve } from '@hono/node-server';

import LoggerFactory from '#lib/logger/loggerfactory.js';

import { DatabaseProviderSymbol } from './db/databaseprovider.js';
import { config } from './lib/config.js';
import createApp from './lib/create-app.js';
import container from './lib/ioc.js';
import { registerRoutes } from './routes.js';

await container.get<DatabaseProvider>(DatabaseProviderSymbol).connect();

const loggerFactory = new LoggerFactory();
const logFunctions = loggerFactory.for(config.LOG_FORMAT);

loggerFactory.applyGlobalLogger(logFunctions);

const app = registerRoutes(createApp(logFunctions));

const server = serve({
    fetch: app.fetch,
    port: config.PORT,
}, (info) => {
    // eslint-disable-next-line no-console
    console.info(`Listening on http://localhost:${info.port}`);
});

['unhandledRejection', 'uncaughtException'].forEach((event) => {
    process.on(event, (error) => {
        logFunctions().critical(error);

        loggerFactory.logger?.closeStream();
        process.exit(1);
    });
});

['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => {
        loggerFactory.logger?.closeStream();

        server.close(() => {
            process.exit(0);
        });
    });
});
