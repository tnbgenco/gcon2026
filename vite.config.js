import { defineConfig } from 'vite'

import { resolve } from 'path'

export default defineConfig({
    base: '/gcon2026/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                day1: resolve(__dirname, 'day1.html'),
                day2: resolve(__dirname, 'day2.html'),
            },
        },
    },
})
