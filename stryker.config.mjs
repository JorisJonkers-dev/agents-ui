/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  mutate: [
    'src/**/*.ts',
    '!src/lib/authApi/index.ts',
    '!src/router/discovery.ts',
  ],
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  ignoreStatic: true,
  vitest: {
    configFile: 'vitest.config.ts',
  },
}

export default config
