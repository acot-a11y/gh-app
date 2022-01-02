import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compress from 'vite-plugin-compression';
import { minifyHtml } from 'vite-plugin-html';

export default defineConfig({
  plugins: [react(), compress(), minifyHtml()],
  server: {
    open: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
