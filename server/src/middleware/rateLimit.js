/**
 * Simple in-memory rate limiter middleware
 * Production apps should use Redis or a similar persistent store
 */

class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 10) {
    this.windowMs = windowMs; // Time window in milliseconds
    this.maxRequests = maxRequests; // Max requests per window
    this.requests = new Map(); // Store: key -> [timestamps]

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Remove expired entries from memory
   */
  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );

      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  /**
   * Check if request should be rate limited
   * @param {string} key - Unique identifier (user ID or IP)
   * @returns {boolean} True if rate limit exceeded
   */
  isRateLimited(key) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Filter out expired timestamps
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validTimestamps.length >= this.maxRequests) {
      return true;
    }

    // Add current request timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return false;
  }

  /**
   * Express middleware factory
   * @param {Object} options - Configuration options
   * @returns {Function} Express middleware
   */
  middleware(options = {}) {
    const keyGenerator = options.keyGenerator || ((req) => req.user?.id || req.ip);

    return (req, res, next) => {
      const key = keyGenerator(req);

      if (this.isRateLimited(key)) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(this.windowMs / 1000), // seconds
        });
      }

      next();
    };
  }
}

// Create rate limiter instances for different endpoints
const linkCreationLimiter = new RateLimiter(60000, 10); // 10 requests per minute
const authLimiter = new RateLimiter(900000, 5); // 5 requests per 15 minutes

module.exports = {
  RateLimiter,
  linkCreationLimiter,
  authLimiter,
};
