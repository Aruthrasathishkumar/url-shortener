/**
 * Parse user agent to detect device type
 * @param {string} userAgent - User agent string
 * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
 */
function parseUserAgent(userAgent) {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  // Check for mobile devices
  if (/(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i.test(ua)) {
    if (/(ipad|tablet|playbook|silk)/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }

  return 'desktop';
}

module.exports = parseUserAgent;
