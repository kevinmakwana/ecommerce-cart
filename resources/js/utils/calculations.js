/**
 * Calculate subtotal from cart items
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Subtotal amount
 */
export const calculateSubtotal = (cartItems) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return 0;
    }
    
    return cartItems.reduce((sum, item) => {
        const price = parseFloat(item.product?.price || 0);
        const quantity = parseInt(item.quantity || 0);
        return sum + (price * quantity);
    }, 0);
};

/**
 * Calculate total with shipping
 * @param {number} subtotal - Subtotal amount
 * @param {number} shipping - Shipping cost (default: 0)
 * @param {number} tax - Tax amount (default: 0)
 * @returns {number} Total amount
 */
export const calculateTotal = (subtotal, shipping = 0, tax = 0) => {
    const sub = parseFloat(subtotal) || 0;
    const ship = parseFloat(shipping) || 0;
    const taxAmount = parseFloat(tax) || 0;
    
    return sub + ship + taxAmount;
};

/**
 * Calculate tax amount
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate (as decimal, e.g., 0.08 for 8%)
 * @returns {number} Tax amount
 */
export const calculateTax = (subtotal, taxRate) => {
    const sub = parseFloat(subtotal) || 0;
    const rate = parseFloat(taxRate) || 0;
    
    if (rate < 0 || rate > 1) {
        return 0;
    }
    
    return sub * rate;
};

/**
 * Calculate discount amount
 * @param {number} amount - Original amount
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {number} Discounted amount
 */
export const calculateDiscount = (amount, discountPercent) => {
    const amt = parseFloat(amount) || 0;
    const discount = parseFloat(discountPercent) || 0;
    
    if (discount < 0 || discount > 100) {
        return amt;
    }
    
    return amt * (discount / 100);
};

/**
 * Calculate item total (price * quantity)
 * @param {number} price - Item price
 * @param {number} quantity - Item quantity
 * @returns {number} Item total
 */
export const calculateItemTotal = (price, quantity) => {
    const p = parseFloat(price) || 0;
    const q = parseInt(quantity) || 0;
    
    return p * q;
};

/**
 * Check if product is low stock
 * @param {number} stockQuantity - Current stock quantity
 * @param {number} threshold - Low stock threshold (default: 10)
 * @returns {boolean} True if low stock
 */
export const isLowStock = (stockQuantity, threshold = 10) => {
    const stock = parseInt(stockQuantity) || 0;
    const thresh = parseInt(threshold) || 10;
    
    return stock > 0 && stock <= thresh;
};

/**
 * Check if product is out of stock
 * @param {number} stockQuantity - Current stock quantity
 * @returns {boolean} True if out of stock
 */
export const isOutOfStock = (stockQuantity) => {
    const stock = parseInt(stockQuantity) || 0;
    return stock <= 0;
};

/**
 * Calculate average order value
 * @param {Array} orders - Array of orders
 * @returns {number} Average order value
 */
export const calculateAverageOrderValue = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        return 0;
    }
    
    const total = orders.reduce((sum, order) => {
        return sum + (parseFloat(order.total) || 0);
    }, 0);
    
    return total / orders.length;
};
