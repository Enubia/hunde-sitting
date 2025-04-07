// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',

    devtools: { enabled: true },

    devServer: {
        port: 3001,
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    logger: {
                        warn() {
                            return null;
                        },
                        debug() {
                            return null;
                        },
                    },

                },
            },
        },
    },

    modules: ['@bootstrap-vue-next/nuxt', '@vueuse/nuxt'],

    bootstrapVueNext: {
        css: false,
    },

    css: ['./assets/scss/main.scss'],
});
