/**
 * Validate email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @param {number} minLength - Minimum length (default: 8)
 * @returns {object} Validation result with isValid and errors
 */
export const validatePassword = (password, minLength = 8) => {
    const errors = [];
    
    if (!password || typeof password !== 'string') {
        return { isValid: false, errors: ['Password is required'] };
    }
    
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters`);
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate quantity value
 * @param {number} quantity - The quantity to validate
 * @param {number} maxStock - Maximum stock available
 * @returns {object} Validation result
 */
export const validateQuantity = (quantity, maxStock) => {
    const qty = parseInt(quantity);
    
    if (isNaN(qty) || qty < 1) {
        return { isValid: false, error: 'Quantity must be at least 1' };
    }
    
    if (maxStock !== undefined && qty > maxStock) {
        return { isValid: false, error: `Maximum quantity is ${maxStock}` };
    }
    
    return { isValid: true, error: null };
};

/**
 * Validate price value
 * @param {number} price - The price to validate
 * @returns {object} Validation result
 */
export const validatePrice = (price) => {
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
};

/**
 * Validate product name
 * @param {string} name - The product name to validate
 * @param {number} minLength - Minimum length (default: 3)
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {object} Validation result
 */
export const validateProductName = (name, minLength = 3, maxLength = 255) => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: 'Product name is required' };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < minLength) {
        return { isValid: false, error: `Product name must be at least ${minLength} characters` };
    }
    
    if (trimmedName.length > maxLength) {
        return { isValid: false, error: `Product name must not exceed ${maxLength} characters` };
    }
    
    return { isValid: true, error: null };
};
