import type { OmitAbleWebRoutes, Router } from '@hunde-sitting/api';

import { hc } from 'hono/client';

// create instance to inline type in build
// https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended
// eslint-disable-next-line unused-imports/no-unused-vars
const client = hc<Router>('');
export type WebClient = Omit<typeof client, OmitAbleWebRoutes>;
export type AdminClient = typeof client;

export function adminClient(...args: Parameters<typeof hc>): AdminClient {
    return hc<Router>(...args);
}

export default (...args: Parameters<typeof hc>): WebClient =>
    hc<Router>(...args);
