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

    applyGlobalLogger(logger: ReturnType<LoggerFactory['for']>) {
        globalThis.log = logger();
    }

    private createConsoleLogger() {
        return (requestId?: string) => {
            const logPrefix = this.getLogPrefix(requestId);

            return this.applyLogLevel({
                debug: (...args: unknown[]) => console.log(
                    this.prepareMessage(
                        chalk.green(logPrefix),
                        chalk.green('[DEBUG]'),
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                info: (...args: unknown[]) => console.log(
                    this.prepareMessage(
                        `${logPrefix}`,
                        '[INFO]',
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                warn: (...args: unknown[]) => console.log(
                    this.prepareMessage(
                        chalk.yellow(logPrefix),
                        chalk.yellow('[WARNING]'),
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                error: (...args: unknown[]) => console.log(
                    this.prepareMessage(
                        chalk.red(logPrefix),
                        chalk.red('[ERROR]'),
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                critical: (...args: unknown[]) => console.log(
                    this.prepareMessage(
                        chalk.magenta(logPrefix),
                        chalk.magenta('[CRITICAL]'),
                        args[0],
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
                debug: (...args: unknown[]) => this._logger?.log(
                    this.prepareMessage(
                        logPrefix,
                        '[DEBUG]',
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                info: (...args: unknown[]) => this._logger?.log(
                    this.prepareMessage(
                        logPrefix,
                        '[INFO]',
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                warn: (...args: unknown[]) => this._logger?.log(
                    this.prepareMessage(
                        logPrefix,
                        '[WARNING]',
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                error: (...args: unknown[]) => this._logger?.log(
                    this.prepareMessage(
                        logPrefix,
                        '[ERROR]',
                        args[0],
                        ...args.slice(1),
                    ),
                ),
                critical: (...args: unknown[]) => this._logger?.log(
                    this.prepareMessage(
                        logPrefix,
                        '[CRITICAL]',
                        args[0],
                        ...args.slice(1),
                    ),
                ),
            });
        };
    }

    private stripColorsFromMessage(message: string) {
        // eslint-disable-next-line no-control-regex
        return message.replace(/\x1B\[\d+m/g, '');
    };

    private getLogPrefix(requestId?: string) {
        return requestId ? `[req-${requestId}]` : '';
    }

    private prepareMessage(prefix: string, level: string, logMessage: unknown, ...args: unknown[]) {
        // from [req-35cfebd5ffaed75831de15d214637508] [INFO] --> GET /admin/dashboard-data?limit=2 200 5ms
        // to [req-35cfebd5ffaed75831de15d214637508] [METHOD] [STATUS] [LEVEL] <incoming|outgoing> /admin/dashboard-data?limit=2 5ms

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
            return `${level} ${logMessage} ${_args.join(' ')}`;
        }

        const [arrows, method, logData, status, time] = (logMessage as string).split(' ');

        let message = prefix;

        if (method) {
            message += ` [${method}]`;
        }

        if (level) {
            message += ` ${level}`;
        }

        if (arrows) {
            const type: string | null = arrows.replace('-->', 'outgoing').replace('<--', 'incoming');

            message += ` ${type}`;
        }

        if (logData) {
            message += ` ${logData}`;
        }

        if (status) {
            message += ` ${this.stripColorsFromMessage(status)}`;
        }

        if (time) {
            message += ` ${time}`;
        }

        return message;
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
