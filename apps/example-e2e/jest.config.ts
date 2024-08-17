/* eslint-disable */
export default {
  displayName: 'example-e2e',
  preset: '../../jest.preset.js',
  setupFiles: ['<rootDir>/src/setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/example-e2e',
};
