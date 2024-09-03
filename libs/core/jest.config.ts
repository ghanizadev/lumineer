import type { Config } from 'jest';

export default {
  displayName: 'core',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage',
  setupFilesAfterEnv: ['./__tests__/setup.ts'],
  collectCoverage: true,
  coverageReporters: ['lcovonly'],
} as Config;
