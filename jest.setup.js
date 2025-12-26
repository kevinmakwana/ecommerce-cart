import '@testing-library/jest-dom';

// Mock Inertia.js route helper
global.route = jest.fn((name) => `/${name}`);

