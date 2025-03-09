// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    devServer: {
        port: 3002,
    },
    modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/color-mode'],
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
    colorMode: {
        classSuffix: '',
    },
});
