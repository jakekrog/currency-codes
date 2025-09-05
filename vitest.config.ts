import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'test/cjs.test.js',
      'test/esm.test.js',
      '.idea',
      '.git',
      '.cache',
      'scripts',
    ],
  },
});
