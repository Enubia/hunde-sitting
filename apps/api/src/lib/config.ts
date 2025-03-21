import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const logLevels = ['debug', 'info', 'warn', 'error', 'critical'] as const;
const logFormat = ['console', 'file'] as const;
const nodeEnv = ['development', 'production', 'test'] as const;

const zodEnv = z.object({
    // Server
    PORT: z.number({ coerce: true }).default(3000),
    LOG_FORMAT: z.enum(logFormat).default('console'),
    LOG_LEVEL: z.enum(logLevels).default('debug'),
    NODE_ENV: z.enum(nodeEnv).default('development'),

    // Database
    POSTGRES_DB: z.string().default('postgres'),
    POSTGRES_HOST: z.string().default('localhost'),
    POSTGRES_USER: z.string().default('postgres'),
    POSTGRES_PASSWORD: z.string().default('postgres'),
    POSTGRES_PORT: z.number({ coerce: true }).default(5432),
});

let schema: z.infer<typeof zodEnv>;

function getEnv() {
    try {
        if (!schema) {
            // eslint-disable-next-line node/no-process-env
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
