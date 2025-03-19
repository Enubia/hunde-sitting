import chalk from 'chalk';

import { config } from '../config.js';
import FileLogger from './filelogger.js';

export default class LoggerFactory {
    private _logger: FileLogger | null = null;

    /**
     * Only available when LOG_FORMAT is set to 'file'
     */
    get logger() {
        return this._logger;
    }

    for(type: typeof config.LOG_FORMAT) {
        switch (type) {
            case 'console':
                return this.createConsoleLogger();
            case 'file':
                return this.createFileLogger();
            default:
                throw new Error('Unknown logger type');
        }
    }

    applyGlobalLogger(preparedLogger: ReturnType<LoggerFactory['for']>) {
        globalThis.log = preparedLogger();
    }

    stripColorsFromMessage(message: string) {
        // eslint-disable-next-line no-control-regex
        return message.replace(/\x1B\[\d+m/g, '');
    };

    private logMessage(message?: string) {
        if (this._logger && message) {
            this._logger.log(message);
        } else if (message) {
            console.log(message);
        }
    }

    private createConsoleLogger() {
        return (requestId?: string) => {
            const logPrefix = this.getLogPrefix(requestId);

            return this.applyLogLevel({
                debug: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'debug',
                        args[0],
                        true,
                        ...args.slice(1),
                    ),
                ),
                info: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        `${logPrefix}`,
                        'info',
                        args[0],
                        true,
                        ...args.slice(1),
                    ),
                ),
                warn: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'warn',
                        args[0],
                        true,
                        ...args.slice(1),
                    ),
                ),
                error: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'error',
                        args[0],
                        true,
                        ...args.slice(1),
                    ),
                ),
                critical: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'critical',
                        args[0],
                        true,
                        ...args.slice(1),
                    ),
                ),
            });
        };
    }

    private createFileLogger() {
        this._logger = new FileLogger();

        return (requestId?: string) => {
            const logPrefix = this.getLogPrefix(requestId);

            // checking for _logger? is stupid but the compiler doesn't complain anymore
            // even tho we know it's not null because it was LITERALLY just set
            return this.applyLogLevel({
                debug: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'debug',
                        args[0],
                        false,
                        ...args.slice(1),
                    ),
                ),
                info: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'info',
                        args[0],
                        false,
                        ...args.slice(1),
                    ),
                ),
                warn: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'warn',
                        args[0],
                        false,
                        ...args.slice(1),
                    ),
                ),
                error: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'error',
                        args[0],
                        false,
                        ...args.slice(1),
                    ),
                ),
                critical: (...args: unknown[]) => this.logMessage(
                    this.prepareMessage(
                        logPrefix,
                        'critical',
                        args[0],
                        false,
                        ...args.slice(1),
                    ),
                ),
            });
        };
    }

    private getLogPrefix(requestId?: string) {
        return requestId ? `[req-${requestId}]` : '';
    }

    private applyColors(message: string, level: string, useColor?: boolean, status?: string) {
        let colorizedMessage = message;

        if (useColor) {
            if (status?.startsWith('4')) {
                colorizedMessage = chalk.yellow(message);
            } else if (status?.startsWith('5')) {
                colorizedMessage = chalk.red(message);
            } else {
                switch (level) {
                    case 'debug':
                        colorizedMessage = chalk.green(message);
                        break;
                    case 'info':
                        colorizedMessage = chalk.white(message);
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
        }

        return colorizedMessage;
    }

    private prepareMessage(
        prefix: string,
        level: typeof config.LOG_LEVEL,
        logMessage: unknown,
        useColor: boolean,
        ...args: unknown[]
    ) {
        let [arrows, method, logData, status, time] = (logMessage as string).split(' ');

        if (arrows === '<--') {
            // don't log request start, only log request end (logs status and time)
            return;
        }

        const timeStamp = `[${new Date().toISOString()}]`;

        const _args: unknown[] = [];

        if (args.length) {
            for (const arg of args) {
                if (typeof arg === 'object' || Array.isArray(arg)) {
                    _args.push(JSON.stringify(arg));
                } else {
                    _args.push(arg);
                }
            }
        }

        if (prefix === '') {
            // no requestId, assume it's a log somewhere in the code base
            const message = `${timeStamp} log.${level.toUpperCase()}: ${logMessage} ${_args.join(' ')}`;

            return this.applyColors(message, level, useColor, status);
        }

        let message = `${timeStamp} ${prefix}`;

        if (method) {
            message += ` [${method}]`;
        }

        message += ` log.${level.toUpperCase()}:`;

        if (logData) {
            message += ` ${logData}`;
        }

        if (status) {
            status = this.stripColorsFromMessage(status);
            message += ` ${status}`;
        }

        if (time) {
            message += ` ${time}`;
        }

        return this.applyColors(message, level, useColor, status);
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
}
