import type LogManager from '#lib/logger/logmanager.ts';

declare global {
    var log: ReturnType<LogManager['applyLogLevel']>;
}
