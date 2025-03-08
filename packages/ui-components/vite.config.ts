import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        vue(),
        dts({
            entryRoot: './src',
            outDir: ['./ui-components/es/src', './ui-components/lib/src'],
            tsconfigPath: './tsconfig.json',
        }),
    ],
    build: {
        outDir: 'es',
        // minify: false,
        rollupOptions: {
            external: ['vue'],
            input: ['index.ts'],
            output: [
                {
                    format: 'es',
                    entryFileNames: '[name].mjs',
                    preserveModules: true,
                    exports: 'named',
                    dir: './ui-components/es',
                },
                {
                    format: 'cjs',
                    entryFileNames: '[name].js',
                    preserveModules: true,
                    exports: 'named',
                    dir: './ui-components/lib',
                },
            ],
        },
        lib: {
            entry: './index.ts',
        },
    },
});
