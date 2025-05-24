import chalk from 'chalk';

import { config } from '../config.js';
import FileLogger from './filelogger.js';

export type RequestLog = ReturnType<LogManager['assignLogFunctions']>;

export default class LogManager {
    private _fileLogger: FileLogger;

    constructor() {
        this._fileLogger = new FileLogger();
    }

    private applyColors(message: string, level: string) {
        const useColor = config.NODE_ENV === 'development';
        let colorizedMessage = message;

        if (useColor) {
            switch (level) {
                case 'debug':
                    colorizedMessage = chalk.green(message);
                    break;
                case 'info':
                    colorizedMessage = message;
                    break;
                case 'warn':
                    colorizedMessage = chalk.yellow(message);
                    break;
                case 'error':
                    colorizedMessage = chalk.red(message);
                    break;
                case 'critical':
                    colorizedMessage = chalk.magenta(message);
                    break;
                default:
                    break;
            }
        }

        return colorizedMessage;
    }

    private applyLogLevel(logFunctions: {
        debug: (...args: unknown[]) => void;
        info: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
        critical: (...args: unknown[]) => void;
    }) {
        switch (config.LOG_LEVEL) {
            case 'debug':
                return logFunctions;
            case 'info':
                return {
                    ...logFunctions,
                    debug: () => {},
                };
            case 'warn':
                return {
                    ...logFunctions,
                    debug: () => {},
                    info: () => {},
                };
            case 'error':
                return {
                    ...logFunctions,
                    debug: () => {},
                    info: () => {},
                    warn: () => {},
                };
            case 'critical':
                return {
                    ...logFunctions,
                    debug: () => {},
                    info: () => {},
                    warn: () => {},
                    error: () => {},
                };
            default:
                throw new Error('Unknown log level');
        }
    }

    private assignLogFunctions(logPrefix: string) {
        return this.applyLogLevel({
            debug: (...args: unknown[]) => this.logMessage(
                this.prepareMessage(
                    logPrefix,
                    'debug',
                    args[0],
                ),
                ...args.slice(1),
            ),
            info: (...args: unknown[]) => this.logMessage(
                this.prepareMessage(
                    `${logPrefix}`,
                    'info',
                    args[0],
                ),
                ...args.slice(1),
            ),
            warn: (...args: unknown[]) => this.logMessage(
                this.prepareMessage(
                    logPrefix,
                    'warn',
                    args[0],
                ),
                ...args.slice(1),
            ),
            error: (...args: unknown[]) => this.logMessage(
                this.prepareMessage(
                    logPrefix,
                    'error',
                    args[0],
                ),
                ...args.slice(1),
            ),
            critical: (...args: unknown[]) => this.logMessage(
                this.prepareMessage(
                    logPrefix,
                    'critical',
                    args[0],
                ),
                ...args.slice(1),
            ),
        });
    }

    private getLogPrefix(requestId?: string) {
        return requestId ? `[req-${requestId}]` : '';
    }

    private logMessage(message?: string, ...args: unknown[]) {
        if (!message) {
            return;
        }

        if (config.LOG_CONSOLE) {
            // eslint-disable-next-line no-console
            return console.log(message, ...args);
        }

        this._fileLogger.log(message, ...args);
    }

    private prepareMessage(
        prefix: string,
        level: typeof config.LOG_LEVEL,
        logMessage: unknown,
    ) {
        const timeStamp = `[${new Date().toISOString()}]`;

        const message = `${timeStamp}${prefix !== '' ? ` ${prefix} ` : ' '}log.${level.toUpperCase()}: ${logMessage}`;

        return this.applyColors(message, level);
    }

    applyGlobalLogger() {
        globalThis.log = this.buildLogger();
    }

    buildLogger() {
        return this.assignLogFunctions('');
    }

    buildRequestLogger(requestId: string) {
        const logPrefix = this.getLogPrefix(requestId);

        return this.assignLogFunctions(logPrefix);
    }

    get fileLoggerInstance() {
        return this._fileLogger;
    }
}
