module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@shared/(.*)$': '<rootDir>/../shared/$1',
        '^@template-emails/(.*)$': '<rootDir>/template-emails/$1',
    },
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
};
