import type { Context } from 'hono';

import { createHash } from 'node:crypto';

export function generateRandomString(myLength: number) {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from({ length: myLength }, (_v, _k) => chars[Math.floor(Math.random() * chars.length)]);
    const randomString = randomArray.join('');

    return randomString;
}

export function md5(...strings: string[]) {
    let hash = createHash('md5');

    for (const s of strings) {
        hash = hash.update(s);
    }

    return hash.digest('hex');
}

export function generateRequestId(c: Context) {
    return () => {
        const header = c.req.header();

        if (header['x-request-id']) {
            return header['x-request-id'];
        }

        return md5(generateRandomString(16));
    };
}
