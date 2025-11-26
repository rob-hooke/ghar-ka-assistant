import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '*.config.js', '.eslintrc.js', '.prettierrc.js'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules/', 'tests/integration/real-bridge.test.js'],
    setupFiles: ['./tests/setup/test-setup.js'],
    testTimeout: 10000,
    reporters: ['verbose'],
  },
});
