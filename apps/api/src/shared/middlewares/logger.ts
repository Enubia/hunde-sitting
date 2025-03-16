/* eslint-disable no-console */
import type { Context } from 'hono';

import chalk from 'chalk';

export function logFunction(c: Context) {
    return (...args: unknown[]) => {
        const id = c.get('requestId');

        c.set('log', {
            debug: (...args: unknown[]) => console.log(chalk.green(`[req-${id}]`, '[DEBUG]'), ...args),
            info: (...args: unknown[]) => console.log(`[req-${id}]`, '[INFO]', ...args),
            warn: (...args: unknown[]) => console.log(chalk.yellow(`[req-${id}]`, '[WARNING]'), ...args),
            error: (...args: unknown[]) => console.log(chalk.red(`[req-${id}]`, '[ERROR]'), ...args),
            critical: (...args: unknown[]) => console.log(chalk.magenta(`[req-${id}]`, '[CRITICAL]'), ...args),
        });

        console.log(`[req-${id}]`, ...args);
    };
}
