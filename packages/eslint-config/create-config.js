import antfu from '@antfu/eslint-config';

export default function createConfig(options, ...userConfigs) {
    return antfu(
        {
            type: 'app',
            typescript: true,
            formatters: true,
            stylistic: {
                indent: 4,
                semi: true,
                quotes: 'single',
            },
            yaml: false,
            ...options,
        },
        {
            rules: {
                'no-console': ['warn', { allow: ['warn', 'error'] }],
                'node/prefer-global/process': 'off',
                'style/brace-style': ['error', '1tbs'],
                'style/comma-dangle': ['error', 'always-multiline'],
                'style/eol-last': ['error', 'always'],
                'style/linebreak-style': ['error', 'unix'],
                'style/quote-props': ['error', 'as-needed'],
                'style/quotes': ['error', 'single', { avoidEscape: true }],
                curly: ['error', 'all'],
                'import/order': 'off',
                'unused-imports/no-unused-imports': 'warn',
                'ts/consistent-type-definitions': ['error', 'type'],
                'antfu/no-top-level-await': ['off'],
                'node/no-process-env': ['error'],
                'perfectionist/sort-imports': ['error', {
                    type: 'alphabetical',
                    order: 'asc',
                    ignoreCase: true,
                    newlinesBetween: 'always',
                    tsconfigRootDir: '.',
                }],
            },
        },
        ...userConfigs,
    );
}
