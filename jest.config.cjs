/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit', '<rootDir>/tests/integration'],
  testMatch: ['**/*.test.ts'],
  testTimeout: 15000,
  transform: {
    '^.+\\.[tj]sx?$': '<rootDir>/jest.esbuild-transformer.cjs'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/utils/whatsappSolicitud.ts',
    'src/data/peruUbigeo.ts',
    'server/domain/**/*.ts',
    'server/application/**/*.ts',
    'server/infrastructure/cache/**/*.ts',
    'server/infrastructure/persistence/**/*.ts',
    'server/infrastructure/gateways/culqiGateway.ts',
    'server/infrastructure/docs/**/*.ts',
    'server/presentation/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
