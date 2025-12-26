import { formatCurrency, formatPrice, formatDate, truncateText } from '../formatters';

describe('formatCurrency', () => {
    test('formats positive numbers correctly', () => {
        expect(formatCurrency(100)).toBe('$100.00');
        expect(formatCurrency(99.99)).toBe('$99.99');
        expect(formatCurrency(1234.567)).toBe('$1234.57');
    });

    test('formats zero correctly', () => {
        expect(formatCurrency(0)).toBe('$0.00');
    });

    test('formats negative numbers correctly', () => {
        expect(formatCurrency(-50)).toBe('$-50.00');
        expect(formatCurrency(-99.99)).toBe('$-99.99');
    });

    test('handles different decimal places', () => {
        expect(formatCurrency(100, 0)).toBe('$100');
        expect(formatCurrency(99.99, 1)).toBe('$100.0');
        expect(formatCurrency(99.999, 3)).toBe('$99.999');
    });

    test('handles invalid inputs', () => {
        expect(formatCurrency(null)).toBe('$0.00');
        expect(formatCurrency(undefined)).toBe('$0.00');
        expect(formatCurrency(NaN)).toBe('$0.00');
        expect(formatCurrency('invalid')).toBe('$0.00');
    });

    test('handles string numbers', () => {
        expect(formatCurrency('100')).toBe('$100.00');
        expect(formatCurrency('99.99')).toBe('$99.99');
    });

    test('handles very large numbers', () => {
        expect(formatCurrency(1000000)).toBe('$1000000.00');
        expect(formatCurrency(999999.99)).toBe('$999999.99');
    });

    test('handles very small numbers', () => {
        expect(formatCurrency(0.01)).toBe('$0.01');
        expect(formatCurrency(0.001)).toBe('$0.00');
    });
});

describe('formatPrice', () => {
    test('formats price to 2 decimal places', () => {
        expect(formatPrice(100)).toBe('100.00');
        expect(formatPrice(99.99)).toBe('99.99');
        expect(formatPrice(99.999)).toBe('100.00');
    });

    test('handles zero', () => {
        expect(formatPrice(0)).toBe('0.00');
    });

    test('handles negative prices', () => {
        expect(formatPrice(-50)).toBe('-50.00');
    });

    test('handles invalid inputs', () => {
        expect(formatPrice(null)).toBe('0.00');
        expect(formatPrice(undefined)).toBe('0.00');
        expect(formatPrice(NaN)).toBe('0.00');
        expect(formatPrice('invalid')).toBe('0.00');
    });

    test('handles string numbers', () => {
        expect(formatPrice('100')).toBe('100.00');
        expect(formatPrice('99.5')).toBe('99.50');
    });

    test('rounds correctly', () => {
        expect(formatPrice(99.994)).toBe('99.99');
        expect(formatPrice(99.995)).toBe('100.00');
        expect(formatPrice(99.996)).toBe('100.00');
    });
});

describe('formatDate', () => {
    const testDate = new Date('2024-12-25T10:30:00');

    test('formats date with medium format by default', () => {
        const result = formatDate(testDate);
        expect(result).toContain('Dec');
        expect(result).toContain('25');
        expect(result).toContain('2024');
    });

    test('formats date with short format', () => {
        const result = formatDate(testDate, 'short');
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    test('formats date with long format', () => {
        const result = formatDate(testDate, 'long');
        expect(result).toContain('December');
        expect(result).toContain('25');
        expect(result).toContain('2024');
    });

    test('handles string dates', () => {
        const result = formatDate('2024-12-25');
        expect(result).toBeTruthy();
        expect(result).toContain('2024');
    });

    test('handles invalid dates', () => {
        expect(formatDate(null)).toBe('');
        expect(formatDate(undefined)).toBe('');
        expect(formatDate('')).toBe('');
        expect(formatDate('invalid')).toBe('');
    });

    test('handles Date objects', () => {
        const result = formatDate(new Date('2024-01-15'));
        expect(result).toContain('2024');
        expect(result).toContain('Jan');
    });
});

describe('truncateText', () => {
    test('truncates text longer than max length', () => {
        expect(truncateText('This is a long text', 10)).toBe('This is a ...');
        expect(truncateText('Hello World', 5)).toBe('Hello...');
    });

    test('does not truncate text shorter than max length', () => {
        expect(truncateText('Short', 10)).toBe('Short');
        expect(truncateText('Hi', 5)).toBe('Hi');
    });

    test('does not truncate text exactly at max length', () => {
        expect(truncateText('Exactly', 7)).toBe('Exactly');
    });

    test('uses custom suffix', () => {
        expect(truncateText('Long text here', 8, '…')).toBe('Long tex…');
        expect(truncateText('Another long text', 7, ' [more]')).toBe('Another [more]');
    });

    test('handles empty or invalid inputs', () => {
        expect(truncateText('', 10)).toBe('');
        expect(truncateText(null, 10)).toBe('');
        expect(truncateText(undefined, 10)).toBe('');
    });

    test('handles non-string inputs', () => {
        expect(truncateText(123, 10)).toBe('');
        expect(truncateText({}, 10)).toBe('');
        expect(truncateText([], 10)).toBe('');
    });

    test('handles zero max length', () => {
        expect(truncateText('Text', 0)).toBe('...');
    });
});
