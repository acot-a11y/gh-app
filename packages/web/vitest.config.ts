/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    deps: {
      inline: ['recoil'],
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});
