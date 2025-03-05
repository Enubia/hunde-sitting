import pluginNext from '@next/eslint-plugin-next';
import pluginQuery from '@tanstack/eslint-plugin-query';

import createConfig from './create-config.js';

export default createConfig(
    {
        react: true,
        ignores: ['.next/*'],
    },
    {
        plugins: {
            '@next/next': pluginNext,
            '@tanstack/query': pluginQuery,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs['core-web-vitals'].rules,
            '@tanstack/query/exhaustive-deps': 'error',
        },
    },
);
