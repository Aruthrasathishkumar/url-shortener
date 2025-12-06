const crypto = require('crypto');

/**
 * Generate a random short code for URLs
 * @param {number} length - Length of the short code (default: 6)
 * @returns {string} Random alphanumeric short code
 */
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
}

module.exports = generateShortCode;
