import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  testMatch: [
    '**/test/integration/**/*.ts'
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage/integration',
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ]
};

export default config;
