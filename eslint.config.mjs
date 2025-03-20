import antfu from '@antfu/eslint-config';

export default antfu(
    {
        formatters: true,
        stylistic: {
            indent: 4,
            quotes: 'single',
            semi: true,
        },
        typescript: true,
        vue: true,
        type: 'app',
        yaml: false,

        ignores: [
            '**/schema.d.ts',
        ],
    },
    {
        rules: {
            'antfu/no-top-level-await': ['off'],
            curly: ['error', 'all'],
            'import/order': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'node/no-process-env': ['error'],
            'node/prefer-global/process': 'off',
            'perfectionist/sort-imports': ['error', {
                ignoreCase: true,
                newlinesBetween: 'always',
                order: 'asc',
                tsconfigRootDir: '.',
                type: 'alphabetical',
                groups: [
                    'external-type',
                    'builtin-type',
                    'internal-type',
                    'parent-type',
                    'sibling-type',
                    'index-type',
                    'external',
                    'builtin',
                    'internal',
                    ['parent', 'sibling'],
                    'index',
                ],
                internalPattern: ['^#'],
            }],
            'style/brace-style': ['error', '1tbs'],
            'style/comma-dangle': ['error', 'always-multiline'],
            'style/eol-last': ['error', 'always'],
            'style/linebreak-style': ['error', 'unix'],
            'style/quote-props': ['error', 'as-needed'],
            'style/quotes': ['error', 'single', { avoidEscape: true }],
            'ts/consistent-type-definitions': 'off',
            'ts/member-ordering': ['error', {
                classes: {
                    order: 'natural-case-insensitive',
                    memberTypes: [
                        // Index signature
                        // No accessibility for index signature.

                        // Fields
                        'public-field', // = ["public-static-field", "public-instance-field"]
                        'protected-field', // = ["protected-static-field", "protected-instance-field"]
                        'private-field', // = ["private-static-field", "private-instance-field"]

                        // Static initialization
                        // No accessibility for static initialization.

                        // Constructors
                        // Only the accessibility of constructors is configurable. See below.

                        // Getters
                        'public-get', // = ["public-static-get", "public-instance-get"]
                        'protected-get', // = ["protected-static-get", "protected-instance-get"]
                        'private-get', // = ["private-static-get", "private-instance-get"]

                        // Setters
                        'public-set', // = ["public-static-set", "public-instance-set"]
                        'protected-set', // = ["protected-static-set", "protected-instance-set"]
                        'private-set', // = ["private-static-set", "private-instance-set"]

                        // Methods
                        'public-method', // = ["public-static-method", "public-instance-method"]
                        'protected-method', // = ["protected-static-method", "protected-instance-method"]
                        'private-method', // = ["private-static-method", "private-instance-method"]
                    ],
                },
            }],
            'unused-imports/no-unused-imports': 'warn',
        },
    },
    {
        files: ['**/migrations/**', '**/seeds/**', '**/logger*'],

        rules: {
            'no-console': 'off',
            'unused-imports/no-unused-vars': 'off',
        },
    },
    {
        files: ['**/*.d.ts'],

        rules: {
            'vars-on-top': 'off',
            'no-var': 'off',
        },
    },
);
