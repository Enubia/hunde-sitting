import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const zodEnv = z.object({
    // Server
    PORT: z.number({ coerce: true }),
    // Database
    POSTGRES_DB: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_PORT: z.number({ coerce: true }),
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
