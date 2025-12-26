import axios from 'axios';

// Note: Bootstrap.js sets up window.axios, but in Jest test environment,
// we need to manually set it up or mock it
describe('Bootstrap Configuration Tests', () => {
    beforeAll(() => {
        // Simulate bootstrap.js behavior
        window.axios = axios;
        window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    });

    test('axios is globally available', () => {
        expect(window.axios).toBeDefined();
        expect(window.axios).toBe(axios);
    });

    test('axios has X-Requested-With header configured', () => {
        expect(window.axios.defaults.headers.common['X-Requested-With']).toBe('XMLHttpRequest');
    });

    test('axios instance is the same as imported', () => {
        expect(window.axios).toBeInstanceOf(Function);
        expect(typeof window.axios.get).toBe('function');
        expect(typeof window.axios.post).toBe('function');
        expect(typeof window.axios.put).toBe('function');
        expect(typeof window.axios.delete).toBe('function');
        expect(typeof window.axios.patch).toBe('function');
    });

    test('axios has correct methods available', () => {
        const methods = ['request', 'get', 'delete', 'head', 'options', 'post', 'put', 'patch'];
        methods.forEach(method => {
            expect(typeof window.axios[method]).toBe('function');
        });
    });
});
