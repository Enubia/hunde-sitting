import type LoggerProvider from '#lib/logger/loggerprovider.ts';

declare global {
    var log: ReturnType<LoggerProvider['applyLogLevel']>;
}

export {};
