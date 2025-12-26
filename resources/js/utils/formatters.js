/**
 * Format a number as currency (USD)
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$0.00';
    }
    return `$${parseFloat(amount).toFixed(decimals)}`;
};

/**
 * Format a price value to 2 decimal places
 * @param {number} price - The price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
        return '0.00';
    }
    return parseFloat(price).toFixed(2);
};

/**
 * Format a date string to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} format - Format type ('short', 'long', 'medium')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
};

/**
 * Truncate text to a maximum length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
};
