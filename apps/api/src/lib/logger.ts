/* eslint-disable no-console */
import type { Context } from 'hono';

import chalk from 'chalk';

export default function logFunction(c: Context) {
    return (message: string, ...rest: unknown[]) => {
        const id = c.get('requestId');

        c.set('log', {
            debug: (...message: string[]) => console.log(chalk.blueBright(`[req-${id}]`, '[DEBUG]', ...message)),
            info: (...message: string[]) => console.log(chalk.green(`[req-${id}]`, '[INFO]', ...message)),
            warn: (...message: string[]) => console.log(chalk.yellow(`[req-${id}]`, '[WARNING]', ...message)),
            error: (...message: string[]) => console.log(chalk.red(`[req-${id}]`, '[ERROR]', ...message)),
            critical: (...message: string[]) => console.log(chalk.magenta(`[req-${id}]`, '[CRITICAL]', ...message)),
        });

        console.log(`[req-${id}] ${message}`, ...rest);
    };
}
