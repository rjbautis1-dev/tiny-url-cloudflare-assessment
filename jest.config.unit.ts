import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  testMatch: [
    '**/test/unit/**/*.ts'
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage/unit',
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ]
};
export default config;
