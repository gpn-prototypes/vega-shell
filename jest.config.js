const path = require('path');

const setupTestFile = path.resolve('setup-tests.ts');

const config = require('@gpn-prototypes/frontend-configs/jest/jest.config')({
  setupFilesAfterEnv: setupTestFile,
});

module.exports = {
  ...config,
  modulePathIgnorePatterns: [...config.modulePathIgnorePatterns, '/e2e-tests/'],
  coveragePathIgnorePatterns: [...config.coveragePathIgnorePatterns, '/e2e-tests/', '/testing/'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/__generated__/**'],
  transformIgnorePatterns: ['node_modules/?!(@gpn-prototypes)/'],
  coverageReporters: ['lcov', 'json-summary', 'text', 'text-summary'],
};
