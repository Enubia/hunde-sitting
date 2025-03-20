import type LoggerFactory from '#lib/logger/loggerfactory.ts';

declare global {
    var log: ReturnType<LoggerFactory['assignLogFunctions']>;
}

export {};
