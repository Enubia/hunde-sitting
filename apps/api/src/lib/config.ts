import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const logLevels = ['debug', 'info', 'warn', 'error', 'critical'] as const;
const nodeEnv = ['development', 'production', 'test'] as const;

const zodEnv = z.object({
    // Server
    PORT: z.number({ coerce: true }).default(3000),
    LOG_LEVEL: z.enum(logLevels).default('debug'),
    LOG_CONSOLE: z.boolean({ coerce: true }).default(false),
    NODE_ENV: z.enum(nodeEnv).default('development'),

    // Database
    POSTGRES_DB: z.string().default('postgres'),
    POSTGRES_HOST: z.string().default('docker.host.internal'),
    POSTGRES_USER: z.string().default('postgres'),
    POSTGRES_PASSWORD: z.string().default('postgres'),
    POSTGRES_PORT: z.number({ coerce: true }).default(5432),
});

let schema: z.infer<typeof zodEnv>;

function getEnv() {
    try {
        if (!schema) {
            schema = zodEnv.parse(process.env);
        }

        return schema;
    } catch (err) {
        if (err instanceof z.ZodError) {
            const { fieldErrors } = err.flatten();
            const errorMessage = Object.entries(fieldErrors)
                .map(([field, errors]) =>
                    errors ? `${field}: ${errors.join(', ')}` : field,
                )
                .join('\n  ');
            throw new Error(
                `Missing environment variables:\n  ${errorMessage}`,
            );
        }

        throw err;
    }
}

export const config = getEnv();
