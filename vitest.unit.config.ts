import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Unit Test Configuration Only
 *
 * Domain: Unit testing only
 * Responsibility: Configure Vitest for isolated unit tests only
 * Boundaries: src/ directory only, excludes ALL integration/E2E tests
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Enable globals for expect, describe, etc.
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'e2e/**',
      '.next/**',
      'features/**',
      'test-results/**',
      'src/__tests__/**', // Exclude ALL test files from unit runs
      '**/*.spec.ts', // Exclude Playwright spec files
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
