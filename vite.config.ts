import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const basePath = process.env.VITE_BASE_PATH ?? '/';
const hpkeCoreEsmPath = path.join(
  path.dirname(require.resolve('@hpke/core/package.json')),
  'esm/mod.js',
);
const hpkeCommonEsmPath = path.join(
  path.dirname(require.resolve('@hpke/common/package.json')),
  'esm/mod.js',
);

export default defineConfig({
  base: basePath,
  resolve: {
    alias: {
      '@hpke/core': hpkeCoreEsmPath,
      '@hpke/common': hpkeCommonEsmPath,
    },
  },
  optimizeDeps: {
    include: ['@cubist-labs/cubesigner-sdk-key-import'],
  },
});
