import 'reflect-metadata';

import type { DatabaseProvider } from './db/databaseprovider.js';

import { serve } from '@hono/node-server';

import LoggerFactory from '#lib/logger/loggerfactory.js';

import { DatabaseProviderSymbol } from './db/databaseprovider.js';
import { config } from './lib/config.js';
import createApp from './lib/create-app.js';
import container from './lib/ioc.js';
import { registerRoutes } from './routes.js';

const db = container.get<DatabaseProvider>(DatabaseProviderSymbol);

await db.connect();

const loggerFactory = new LoggerFactory();

const logFunctions = loggerFactory.createLogger();

loggerFactory.applyGlobalLogger(logFunctions());

const app = registerRoutes(createApp(logFunctions));

serve({
    fetch: app.fetch,
    port: config.PORT,
}, (info) => {
    // eslint-disable-next-line no-console
    console.info(`Listening on http://localhost:${info.port}`);
});

['unhandledRejection', 'uncaughtException'].forEach((event) => {
    process.on(event, async (error) => {
        logFunctions().critical(error);

        loggerFactory.fileLoggerInstance.closeStream();

        await db.close();

        process.exit(1);
    });
});

['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, async () => {
        loggerFactory.fileLoggerInstance.closeStream();

        await db.close();

        process.exit(0);
    });
});
