import { calculateSubtotal, isLowStock } from '../utils/calculations';
import { validateQuantity, validatePrice } from '../utils/validators';

describe('Cart Business Logic Integration Tests', () => {
    describe('Adding items to cart', () => {
        test('validates quantity before adding to cart', () => {
            const product = { id: 1, price: 19.99, stock_quantity: 10 };
            const quantity = 5;

            const validation = validateQuantity(quantity, product.stock_quantity);
            expect(validation.isValid).toBe(true);
        });

        test('prevents adding more than available stock', () => {
            const product = { id: 1, price: 19.99, stock_quantity: 10 };
            const quantity = 15;

            const validation = validateQuantity(quantity, product.stock_quantity);
            expect(validation.isValid).toBe(false);
            expect(validation.error).toBe('Maximum quantity is 10');
        });

        test('prevents adding zero or negative quantities', () => {
            const quantity = 0;
            const validation = validateQuantity(quantity);
            expect(validation.isValid).toBe(false);
        });
    });

    describe('Cart calculations', () => {
        test('calculates cart subtotal correctly', () => {
            const cartItems = [
                { product: { price: 19.99 }, quantity: 2 },
                { product: { price: 29.99 }, quantity: 1 },
                { product: { price: 9.99 }, quantity: 3 }
            ];

            const subtotal = calculateSubtotal(cartItems);
            expect(subtotal).toBeCloseTo(99.94, 2);
        });

        test('handles empty cart', () => {
            const subtotal = calculateSubtotal([]);
            expect(subtotal).toBe(0);
        });

        test('calculates subtotal with single item', () => {
            const cartItems = [
                { product: { price: 50.00 }, quantity: 1 }
            ];

            const subtotal = calculateSubtotal(cartItems);
            expect(subtotal).toBe(50);
        });
    });

    describe('Stock management', () => {
        test('identifies low stock products', () => {
            expect(isLowStock(5)).toBe(true);
            expect(isLowStock(10)).toBe(true);
            expect(isLowStock(15)).toBe(false);
        });

        test('prevents ordering out of stock items', () => {
            const product = { stock_quantity: 0 };
            const validation = validateQuantity(1, product.stock_quantity);
            expect(validation.isValid).toBe(false);
        });
    });

    describe('Product pricing', () => {
        test('validates product price', () => {
            const priceValidation = validatePrice(19.99);
            expect(priceValidation.isValid).toBe(true);
        });

        test('rejects invalid prices', () => {
            expect(validatePrice(-10).isValid).toBe(false);
            expect(validatePrice(0).isValid).toBe(false);
            expect(validatePrice('invalid').isValid).toBe(false);
        });
    });
});
