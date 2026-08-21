/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  // Stryker's `break` defaults to null, which means the mutation score never
  // fails the build -- so the required Mutation Tests check could only fail if
  // Stryker itself errored, not if the score collapsed. The floor is set just
  // under the current score (58.21% over 3276 mutants, reproduced to within
  // 0.03 points across two full runs) so it catches a regression without
  // demanding an immediate improvement. Raise it as the score rises; never
  // lower it to make a red build green.
  thresholds: { high: 80, low: 60, break: 55 },
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/lib/authApi/index.ts',
    '!src/router/discovery.ts',
  ],
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  reporters: ['html', 'clear-text', 'progress'],
  // 'perTest' cannot attribute static mutants -- code that runs once at module
  // load, such as the zod schemas and route tables -- so they were suppressed
  // by `ignoreStatic: true` and never scored. Measured on this tree: 'all'
  // evaluates 3276 mutants and scores 58.21% in 9m49s, against 3103 mutants
  // and 56.30% in 8m06s for 'perTest' with `ignoreStatic: true`. 21% more
  // runtime buys a score that covers the whole source.
  coverageAnalysis: 'all',
  vitest: {
    configFile: 'vitest.config.ts',
  },
}

export default config
