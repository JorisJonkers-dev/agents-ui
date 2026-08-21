/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  // Stryker's `break` defaults to null, which means the mutation score never
  // fails the build -- so the required Mutation Tests check could only fail if
  // Stryker itself errored, not if the score collapsed. The floor is set just
  // under the current score (55.04% over ~2450 mutants) so it catches a
  // regression without demanding an immediate improvement. Raise it as the
  // score rises; never lower it to make a red build green.
  thresholds: { high: 80, low: 60, break: 52 },
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
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
