/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 30000,
};
