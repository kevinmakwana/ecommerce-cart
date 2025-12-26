import {
    validateEmail,
    validatePassword,
    validateQuantity,
    validatePrice,
    validateProductName
} from '../validators';

describe('validateEmail', () => {
    test('validates correct email addresses', () => {
        expect(validateEmail('user@example.com')).toBe(true);
        expect(validateEmail('test.user@domain.co.uk')).toBe(true);
        expect(validateEmail('name+tag@company.com')).toBe(true);
    });

    test('rejects invalid email addresses', () => {
        expect(validateEmail('invalid')).toBe(false);
        expect(validateEmail('user@')).toBe(false);
        expect(validateEmail('@domain.com')).toBe(false);
        expect(validateEmail('user @domain.com')).toBe(false);
        expect(validateEmail('user@domain')).toBe(false);
    });

    test('handles empty or null values', () => {
        expect(validateEmail('')).toBe(false);
        expect(validateEmail(null)).toBe(false);
        expect(validateEmail(undefined)).toBe(false);
    });

    test('handles non-string inputs', () => {
        expect(validateEmail(123)).toBe(false);
        expect(validateEmail({})).toBe(false);
        expect(validateEmail([])).toBe(false);
    });

    test('trims whitespace', () => {
        expect(validateEmail('  user@example.com  ')).toBe(true);
    });
});

describe('validatePassword', () => {
    test('validates strong passwords', () => {
        const result = validatePassword('SecurePass123');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('validates password with custom minimum length', () => {
        const result = validatePassword('Pass1', 4);
        expect(result.isValid).toBe(true);
    });

    test('rejects passwords that are too short', () => {
        const result = validatePassword('Short1');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters');
    });

    test('rejects passwords without uppercase letters', () => {
        const result = validatePassword('lowercase123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('rejects passwords without lowercase letters', () => {
        const result = validatePassword('UPPERCASE123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('rejects passwords without numbers', () => {
        const result = validatePassword('NoNumbersHere');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one number');
    });

    test('returns multiple errors for weak passwords', () => {
        const result = validatePassword('weak');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
    });

    test('handles empty or null passwords', () => {
        expect(validatePassword('').isValid).toBe(false);
        expect(validatePassword(null).isValid).toBe(false);
        expect(validatePassword(undefined).isValid).toBe(false);
    });

    test('handles non-string inputs', () => {
        expect(validatePassword(123).isValid).toBe(false);
    });
});

describe('validateQuantity', () => {
    test('validates positive quantities', () => {
        expect(validateQuantity(1).isValid).toBe(true);
        expect(validateQuantity(10).isValid).toBe(true);
        expect(validateQuantity(100).isValid).toBe(true);
    });

    test('validates quantity within stock limit', () => {
        const result = validateQuantity(5, 10);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
    });

    test('rejects zero or negative quantities', () => {
        expect(validateQuantity(0).isValid).toBe(false);
        expect(validateQuantity(-1).isValid).toBe(false);
        expect(validateQuantity(-10).isValid).toBe(false);
    });

    test('rejects quantities exceeding stock', () => {
        const result = validateQuantity(15, 10);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Maximum quantity is 10');
    });

    test('accepts quantity equal to stock', () => {
        const result = validateQuantity(10, 10);
        expect(result.isValid).toBe(true);
    });

    test('handles string numbers', () => {
        expect(validateQuantity('5').isValid).toBe(true);
        expect(validateQuantity('10', 15).isValid).toBe(true);
    });

    test('handles invalid inputs', () => {
        expect(validateQuantity('invalid').isValid).toBe(false);
        expect(validateQuantity(NaN).isValid).toBe(false);
        expect(validateQuantity(null).isValid).toBe(false);
    });
});

describe('validatePrice', () => {
    test('validates positive prices', () => {
        expect(validatePrice(10).isValid).toBe(true);
        expect(validatePrice(99.99).isValid).toBe(true);
        expect(validatePrice(0.01).isValid).toBe(true);
    });

    test('rejects negative prices', () => {
        const result = validatePrice(-10);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Price cannot be negative');
    });

    test('rejects zero price', () => {
        const result = validatePrice(0);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Price must be greater than zero');
    });

    test('handles string numbers', () => {
        expect(validatePrice('99.99').isValid).toBe(true);
        expect(validatePrice('10').isValid).toBe(true);
    });

    test('handles invalid inputs', () => {
        expect(validatePrice('invalid').isValid).toBe(false);
        expect(validatePrice(NaN).isValid).toBe(false);
        expect(validatePrice(null).isValid).toBe(false);
        expect(validatePrice(undefined).isValid).toBe(false);
    });

    test('validates decimal prices', () => {
        expect(validatePrice(19.99).isValid).toBe(true);
        expect(validatePrice(99.999).isValid).toBe(true);
    });
});

describe('validateProductName', () => {
    test('validates valid product names', () => {
        expect(validateProductName('Product Name').isValid).toBe(true);
        expect(validateProductName('A Great Product').isValid).toBe(true);
        expect(validateProductName('ABC').isValid).toBe(true);
    });

    test('validates with custom min and max length', () => {
        expect(validateProductName('AB', 2, 10).isValid).toBe(true);
        expect(validateProductName('LongName', 5, 10).isValid).toBe(true);
    });

    test('rejects names that are too short', () => {
        const result = validateProductName('AB');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Product name must be at least 3 characters');
    });

    test('rejects names that are too long', () => {
        const longName = 'A'.repeat(256);
        const result = validateProductName(longName);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Product name must not exceed 255 characters');
    });

    test('handles empty or null names', () => {
        expect(validateProductName('').isValid).toBe(false);
        expect(validateProductName(null).isValid).toBe(false);
        expect(validateProductName(undefined).isValid).toBe(false);
    });

    test('handles non-string inputs', () => {
        expect(validateProductName(123).isValid).toBe(false);
        expect(validateProductName({}).isValid).toBe(false);
    });

    test('trims whitespace before validation', () => {
        expect(validateProductName('  AB  ').isValid).toBe(false);
        expect(validateProductName('  ABC  ').isValid).toBe(true);
    });

    test('accepts names at exact boundaries', () => {
        expect(validateProductName('ABC', 3, 10).isValid).toBe(true);
        expect(validateProductName('1234567890', 3, 10).isValid).toBe(true);
    });
});
