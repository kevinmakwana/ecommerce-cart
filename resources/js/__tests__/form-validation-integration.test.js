import { validateEmail, validatePassword, validateProductName } from '../utils/validators';
import { formatCurrency, formatDate } from '../utils/formatters';

describe('Form Validation Integration Tests', () => {
    describe('User Registration Form', () => {
        test('validates complete registration form', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'SecurePass123',
                password_confirmation: 'SecurePass123'
            };

            const emailValid = validateEmail(formData.email);
            const passwordValid = validatePassword(formData.password);
            const nameValid = validateProductName(formData.name); // Using same validation

            expect(emailValid).toBe(true);
            expect(passwordValid.isValid).toBe(true);
            expect(nameValid.isValid).toBe(true);
        });

        test('rejects invalid registration data', () => {
            const formData = {
                name: 'AB', // Too short
                email: 'invalid-email',
                password: 'weak'
            };

            const emailValid = validateEmail(formData.email);
            const passwordValid = validatePassword(formData.password);

            expect(emailValid).toBe(false);
            expect(passwordValid.isValid).toBe(false);
        });
    });

    describe('Product Creation Form', () => {
        test('validates complete product form', () => {
            const productData = {
                name: 'Test Product',
                description: 'A great product',
                price: 29.99,
                stock_quantity: 100
            };

            const nameValid = validateProductName(productData.name);
            const priceValid = validatePrice(productData.price);

            expect(nameValid.isValid).toBe(true);
            expect(priceValid.isValid).toBe(true);
        });

        test('formats product price for display', () => {
            const price = 29.99;
            const formatted = formatCurrency(price);
            expect(formatted).toBe('$29.99');
        });

        test('rejects invalid product data', () => {
            const productData = {
                name: 'AB', // Too short
                price: -10 // Invalid
            };

            const nameValid = validateProductName(productData.name);
            const priceValid = validatePrice(productData.price);

            expect(nameValid.isValid).toBe(false);
            expect(priceValid.isValid).toBe(false);
        });
    });

    describe('Order Display Integration', () => {
        test('formats order data correctly', () => {
            const order = {
                id: 1,
                total: 129.99,
                created_at: '2024-12-25T10:30:00'
            };

            const formattedTotal = formatCurrency(order.total);
            const formattedDate = formatDate(order.created_at);

            expect(formattedTotal).toBe('$129.99');
            expect(formattedDate).toBeTruthy();
        });
    });
});

function validatePrice(price) {
    const priceNum = parseFloat(price);
    
    if (isNaN(priceNum)) {
        return { isValid: false, error: 'Price must be a valid number' };
    }
    
    if (priceNum < 0) {
        return { isValid: false, error: 'Price cannot be negative' };
    }
    
    if (priceNum === 0) {
        return { isValid: false, error: 'Price must be greater than zero' };
    }
    
    return { isValid: true, error: null };
}
