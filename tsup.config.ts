import { defineConfig } from 'tsup';
import { copyFileSync, existsSync } from 'node:fs';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.ts',
  },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  },
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  onSuccess: async () => {
    if (existsSync('src/react/styles.css')) {
      copyFileSync('src/react/styles.css', 'dist/styles.css');
    }
  },
});
