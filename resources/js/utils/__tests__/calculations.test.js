import {
    calculateSubtotal,
    calculateTotal,
    calculateTax,
    calculateDiscount,
    calculateItemTotal,
    isLowStock,
    isOutOfStock,
    calculateAverageOrderValue
} from '../calculations';

describe('calculateSubtotal', () => {
    test('calculates subtotal for cart items', () => {
        const cartItems = [
            { product: { price: 10.00 }, quantity: 2 },
            { product: { price: 15.50 }, quantity: 1 },
            { product: { price: 5.00 }, quantity: 3 }
        ];
        expect(calculateSubtotal(cartItems)).toBe(50.50);
    });

    test('handles empty cart', () => {
        expect(calculateSubtotal([])).toBe(0);
    });

    test('handles null or undefined input', () => {
        expect(calculateSubtotal(null)).toBe(0);
        expect(calculateSubtotal(undefined)).toBe(0);
    });

    test('handles items with missing price', () => {
        const cartItems = [
            { product: {}, quantity: 2 },
            { product: { price: 10 }, quantity: 1 }
        ];
        expect(calculateSubtotal(cartItems)).toBe(10);
    });

    test('handles items with missing quantity', () => {
        const cartItems = [
            { product: { price: 10 } },
            { product: { price: 20 }, quantity: 2 }
        ];
        expect(calculateSubtotal(cartItems)).toBe(40);
    });

    test('handles string prices and quantities', () => {
        const cartItems = [
            { product: { price: '10.50' }, quantity: '2' }
        ];
        expect(calculateSubtotal(cartItems)).toBe(21);
    });

    test('handles decimal calculations correctly', () => {
        const cartItems = [
            { product: { price: 19.99 }, quantity: 3 }
        ];
        expect(calculateSubtotal(cartItems)).toBeCloseTo(59.97, 2);
    });
});

describe('calculateTotal', () => {
    test('calculates total with subtotal only', () => {
        expect(calculateTotal(100)).toBe(100);
    });

    test('calculates total with subtotal and shipping', () => {
        expect(calculateTotal(100, 10)).toBe(110);
    });

    test('calculates total with subtotal, shipping, and tax', () => {
        expect(calculateTotal(100, 10, 8)).toBe(118);
    });

    test('handles zero values', () => {
        expect(calculateTotal(0, 0, 0)).toBe(0);
    });

    test('handles missing parameters (defaults to 0)', () => {
        expect(calculateTotal(100)).toBe(100);
        expect(calculateTotal(100, undefined, 5)).toBe(105);
    });

    test('handles string numbers', () => {
        expect(calculateTotal('100', '10', '5')).toBe(115);
    });

    test('handles invalid inputs', () => {
        expect(calculateTotal('invalid', 10, 5)).toBe(15);
        expect(calculateTotal(100, 'invalid', 5)).toBe(105);
    });

    test('handles decimal values', () => {
        expect(calculateTotal(99.99, 5.50, 8.25)).toBeCloseTo(113.74, 2);
    });
});

describe('calculateTax', () => {
    test('calculates tax correctly', () => {
        expect(calculateTax(100, 0.08)).toBe(8);
        expect(calculateTax(50, 0.10)).toBe(5);
    });

    test('handles zero tax rate', () => {
        expect(calculateTax(100, 0)).toBe(0);
    });

    test('handles zero subtotal', () => {
        expect(calculateTax(0, 0.08)).toBe(0);
    });

    test('rejects invalid tax rates (negative)', () => {
        expect(calculateTax(100, -0.05)).toBe(0);
    });

    test('rejects invalid tax rates (greater than 1)', () => {
        expect(calculateTax(100, 1.5)).toBe(0);
    });

    test('accepts tax rate at boundaries', () => {
        expect(calculateTax(100, 0)).toBe(0);
        expect(calculateTax(100, 1)).toBe(100);
    });

    test('handles decimal calculations', () => {
        expect(calculateTax(99.99, 0.075)).toBeCloseTo(7.499, 2);
    });

    test('handles string inputs', () => {
        expect(calculateTax('100', '0.08')).toBe(8);
    });
});

describe('calculateDiscount', () => {
    test('calculates discount correctly', () => {
        expect(calculateDiscount(100, 10)).toBe(10);
        expect(calculateDiscount(50, 20)).toBe(10);
    });

    test('handles zero discount', () => {
        expect(calculateDiscount(100, 0)).toBe(0);
    });

    test('handles 100% discount', () => {
        expect(calculateDiscount(100, 100)).toBe(100);
    });

    test('rejects negative discount', () => {
        expect(calculateDiscount(100, -10)).toBe(100);
    });

    test('rejects discount over 100%', () => {
        expect(calculateDiscount(100, 150)).toBe(100);
    });

    test('handles decimal discount percentages', () => {
        expect(calculateDiscount(100, 12.5)).toBe(12.5);
    });

    test('handles zero amount', () => {
        expect(calculateDiscount(0, 10)).toBe(0);
    });

    test('handles string inputs', () => {
        expect(calculateDiscount('100', '15')).toBe(15);
    });
});

describe('calculateItemTotal', () => {
    test('calculates item total correctly', () => {
        expect(calculateItemTotal(10, 2)).toBe(20);
        expect(calculateItemTotal(19.99, 3)).toBeCloseTo(59.97, 2);
    });

    test('handles zero price', () => {
        expect(calculateItemTotal(0, 5)).toBe(0);
    });

    test('handles zero quantity', () => {
        expect(calculateItemTotal(10, 0)).toBe(0);
    });

    test('handles quantity of 1', () => {
        expect(calculateItemTotal(25.50, 1)).toBe(25.50);
    });

    test('handles string inputs', () => {
        expect(calculateItemTotal('10', '5')).toBe(50);
    });

    test('handles invalid inputs', () => {
        expect(calculateItemTotal('invalid', 5)).toBe(0);
        expect(calculateItemTotal(10, 'invalid')).toBe(0);
    });

    test('handles large quantities', () => {
        expect(calculateItemTotal(1.99, 1000)).toBeCloseTo(1990, 2);
    });
});

describe('isLowStock', () => {
    test('identifies low stock correctly', () => {
        expect(isLowStock(5)).toBe(true);
        expect(isLowStock(10)).toBe(true);
        expect(isLowStock(1)).toBe(true);
    });

    test('identifies adequate stock', () => {
        expect(isLowStock(11)).toBe(false);
        expect(isLowStock(50)).toBe(false);
        expect(isLowStock(100)).toBe(false);
    });

    test('identifies out of stock as not low stock', () => {
        expect(isLowStock(0)).toBe(false);
        expect(isLowStock(-1)).toBe(false);
    });

    test('uses custom threshold', () => {
        expect(isLowStock(15, 20)).toBe(true);
        expect(isLowStock(25, 20)).toBe(false);
    });

    test('handles edge cases at threshold', () => {
        expect(isLowStock(10, 10)).toBe(true);
        expect(isLowStock(11, 10)).toBe(false);
    });

    test('handles string inputs', () => {
        expect(isLowStock('5')).toBe(true);
        expect(isLowStock('15')).toBe(false);
    });

    test('handles invalid inputs', () => {
        expect(isLowStock('invalid')).toBe(false);
        expect(isLowStock(null)).toBe(false);
    });
});

describe('isOutOfStock', () => {
    test('identifies out of stock correctly', () => {
        expect(isOutOfStock(0)).toBe(true);
        expect(isOutOfStock(-1)).toBe(true);
        expect(isOutOfStock(-10)).toBe(true);
    });

    test('identifies in stock correctly', () => {
        expect(isOutOfStock(1)).toBe(false);
        expect(isOutOfStock(10)).toBe(false);
        expect(isOutOfStock(100)).toBe(false);
    });

    test('handles string inputs', () => {
        expect(isOutOfStock('0')).toBe(true);
        expect(isOutOfStock('5')).toBe(false);
    });

    test('handles invalid inputs', () => {
        expect(isOutOfStock('invalid')).toBe(true);
        expect(isOutOfStock(null)).toBe(true);
        expect(isOutOfStock(undefined)).toBe(true);
    });
});

describe('calculateAverageOrderValue', () => {
    test('calculates average order value correctly', () => {
        const orders = [
            { total: 100 },
            { total: 200 },
            { total: 300 }
        ];
        expect(calculateAverageOrderValue(orders)).toBe(200);
    });

    test('handles single order', () => {
        const orders = [{ total: 150 }];
        expect(calculateAverageOrderValue(orders)).toBe(150);
    });

    test('handles empty orders array', () => {
        expect(calculateAverageOrderValue([])).toBe(0);
    });

    test('handles null or undefined input', () => {
        expect(calculateAverageOrderValue(null)).toBe(0);
        expect(calculateAverageOrderValue(undefined)).toBe(0);
    });

    test('handles orders with decimal totals', () => {
        const orders = [
            { total: 99.99 },
            { total: 150.50 }
        ];
        expect(calculateAverageOrderValue(orders)).toBeCloseTo(125.245, 2);
    });

    test('handles orders with string totals', () => {
        const orders = [
            { total: '100' },
            { total: '200' }
        ];
        expect(calculateAverageOrderValue(orders)).toBe(150);
    });

    test('handles orders with missing totals', () => {
        const orders = [
            { total: 100 },
            {},
            { total: 200 }
        ];
        expect(calculateAverageOrderValue(orders)).toBeCloseTo(100, 2);
    });
});
