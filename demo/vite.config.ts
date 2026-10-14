import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: 'demo',
  base: './',
  resolve: {
    alias: {
      'cron-schedule-kit/react': path.resolve(__dirname, '../src/react.ts'),
      'cron-schedule-kit/styles.css': path.resolve(__dirname, '../src/react/styles.css'),
      'cron-schedule-kit': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
});
