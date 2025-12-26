module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/resources/js/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@inertiajs|lodash-es)/)',
    ],
    testMatch: [
        '<rootDir>/resources/js/**/__tests__/**/*.[jt]s?(x)',
        '<rootDir>/resources/js/**/?(*.)+(spec|test).[jt]s?(x)',
    ],
    collectCoverageFrom: [
        'resources/js/**/*.{js,jsx}',
        '!resources/js/**/*.test.{js,jsx}',
        '!resources/js/**/__tests__/**',
    ],
};
