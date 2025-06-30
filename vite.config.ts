/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    server: {
      deps: {
        inline: ['vuetify']
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
          'src/components/**/*.vue',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'src/vite-env.d.ts',
        'src/types/**',
        'android/**',
        'ios/**',
        'capacitor.config.ts'
      ]
    },
    setupFiles: ['./src/test/setup.ts']
  }
})