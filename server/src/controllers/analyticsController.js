const pool = require('../config/db');
const parseUserAgent = require('../utils/parseUserAgent');

/**
 * Get analytics for a specific link
 */
async function getLinkAnalytics(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { from, to } = req.query;

    // Verify link ownership
    const linkCheck = await pool.query(
      'SELECT id FROM links WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (linkCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Link not found.',
      });
    }

    // Build date filter
    let dateFilter = '';
    const queryParams = [id];

    if (from && to) {
      dateFilter = 'AND clicked_at >= $2 AND clicked_at <= $3';
      queryParams.push(new Date(from), new Date(to));
    } else if (from) {
      dateFilter = 'AND clicked_at >= $2';
      queryParams.push(new Date(from));
    } else if (to) {
      dateFilter = 'AND clicked_at <= $2';
      queryParams.push(new Date(to));
    }

    // Get total clicks
    const totalClicksResult = await pool.query(
      `SELECT COUNT(*) as total FROM clicks WHERE link_id = $1 ${dateFilter}`,
      queryParams
    );

    const totalClicks = parseInt(totalClicksResult.rows[0].total, 10);

    // Get clicks over time (grouped by day)
    const clicksOverTimeResult = await pool.query(
      `SELECT
        DATE(clicked_at) as date,
        COUNT(*) as clicks
      FROM clicks
      WHERE link_id = $1 ${dateFilter}
      GROUP BY DATE(clicked_at)
      ORDER BY date ASC`,
      queryParams
    );

    const clicksOverTime = clicksOverTimeResult.rows.map((row) => ({
      date: row.date,
      clicks: parseInt(row.clicks, 10),
    }));

    // Get top referrers
    const topReferrersResult = await pool.query(
      `SELECT
        COALESCE(referrer, 'Direct') as referrer,
        COUNT(*) as clicks
      FROM clicks
      WHERE link_id = $1 ${dateFilter}
      GROUP BY referrer
      ORDER BY clicks DESC
      LIMIT 10`,
      queryParams
    );

    const topReferrers = topReferrersResult.rows.map((row) => ({
      referrer: row.referrer,
      clicks: parseInt(row.clicks, 10),
    }));

    // Get all clicks to analyze devices
    const clicksResult = await pool.query(
      `SELECT user_agent FROM clicks WHERE link_id = $1 ${dateFilter}`,
      queryParams
    );

    // Parse device types
    const deviceCounts = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      unknown: 0,
    };

    clicksResult.rows.forEach((row) => {
      const deviceType = parseUserAgent(row.user_agent);
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
    });

    const devices = Object.entries(deviceCounts)
      .filter(([, count]) => count > 0)
      .map(([device, count]) => ({
        device,
        clicks: count,
      }));

    res.json({
      analytics: {
        totalClicks,
        clicksOverTime,
        topReferrers,
        devices,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Server error while fetching analytics.',
    });
  }
}

module.exports = {
  getLinkAnalytics,
};
