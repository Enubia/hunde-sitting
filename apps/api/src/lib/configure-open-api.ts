import { apiReference } from '@scalar/hono-api-reference';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { AppOpenAPI } from './types.js';

import { BASE_PATH } from './constants.js';

const packageJsonPath = resolve(import.meta.dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

export default function configureOpenAPI(app: AppOpenAPI) {
    app.doc('/doc', {
        openapi: '3.0.0',
        info: {
            version: packageJson.version,
            title: 'Tasks API',
        },
    });

    app.get(
        '/reference',
        apiReference({
            theme: 'kepler',
            layout: 'classic',
            defaultHttpClient: {
                targetKey: 'js',
                clientKey: 'fetch',
            },
            spec: {
                url: `${BASE_PATH}/doc`,
            },
        }),
    );
}
