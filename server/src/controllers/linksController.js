const pool = require('../config/db');
const generateShortCode = require('../utils/generateShortCode');
const validateUrl = require('../utils/validateUrl');

/**
 * Create a new short link
 */
async function createLink(req, res) {
  try {
    const { originalUrl, customSlug, expiresAt } = req.body;
    const userId = req.user.id;

    // Validate original URL
    if (!originalUrl) {
      return res.status(400).json({
        error: 'Original URL is required.',
      });
    }

    if (!validateUrl(originalUrl)) {
      return res.status(400).json({
        error: 'Invalid URL format. URL must start with http:// or https://',
      });
    }

    // Determine short code
    let shortCode = customSlug;

    if (customSlug) {
      // Validate custom slug format
      if (!/^[a-zA-Z0-9_-]+$/.test(customSlug)) {
        return res.status(400).json({
          error: 'Custom slug can only contain letters, numbers, hyphens, and underscores.',
        });
      }

      // Check if custom slug is already taken
      const existing = await pool.query(
        'SELECT id FROM links WHERE short_code = $1',
        [customSlug]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          error: 'Custom slug is already taken. Please choose another.',
        });
      }
    } else {
      // Generate unique short code
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        shortCode = generateShortCode(6);

        const existing = await pool.query(
          'SELECT id FROM links WHERE short_code = $1',
          [shortCode]
        );

        if (existing.rows.length === 0) {
          break;
        }

        attempts++;
      }

      if (attempts === maxAttempts) {
        return res.status(500).json({
          error: 'Failed to generate unique short code. Please try again.',
        });
      }
    }

    // Parse expiration date
    let expirationDate = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);

      if (isNaN(expirationDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid expiration date format.',
        });
      }

      if (expirationDate <= new Date()) {
        return res.status(400).json({
          error: 'Expiration date must be in the future.',
        });
      }
    }

    // Insert link
    const result = await pool.query(
      `INSERT INTO links (user_id, original_url, short_code, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, original_url, short_code, expires_at, is_active, created_at`,
      [userId, originalUrl, shortCode, expirationDate]
    );

    const link = result.rows[0];

    res.status(201).json({
      message: 'Link created successfully.',
      link: {
        id: link.id,
        originalUrl: link.original_url,
        shortCode: link.short_code,
        shortUrl: `${process.env.BASE_URL}/${link.short_code}`,
        expiresAt: link.expires_at,
        isActive: link.is_active,
        createdAt: link.created_at,
      },
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({
      error: 'Server error while creating link.',
    });
  }
}

/**
 * Get all links for the current user
 */
async function getLinks(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        l.id, l.original_url, l.short_code, l.expires_at, l.is_active, l.created_at,
        COUNT(c.id) as click_count
      FROM links l
      LEFT JOIN clicks c ON l.id = c.link_id
      WHERE l.user_id = $1
      GROUP BY l.id
      ORDER BY l.created_at DESC`,
      [userId]
    );

    const links = result.rows.map((link) => ({
      id: link.id,
      originalUrl: link.original_url,
      shortCode: link.short_code,
      shortUrl: `${process.env.BASE_URL}/${link.short_code}`,
      expiresAt: link.expires_at,
      isActive: link.is_active,
      createdAt: link.created_at,
      clickCount: parseInt(link.click_count, 10),
    }));

    res.json({
      links,
    });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({
      error: 'Server error while fetching links.',
    });
  }
}

/**
 * Get a single link by ID
 */
async function getLinkById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        l.id, l.original_url, l.short_code, l.expires_at, l.is_active, l.created_at,
        COUNT(c.id) as click_count
      FROM links l
      LEFT JOIN clicks c ON l.id = c.link_id
      WHERE l.id = $1 AND l.user_id = $2
      GROUP BY l.id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Link not found.',
      });
    }

    const link = result.rows[0];

    res.json({
      link: {
        id: link.id,
        originalUrl: link.original_url,
        shortCode: link.short_code,
        shortUrl: `${process.env.BASE_URL}/${link.short_code}`,
        expiresAt: link.expires_at,
        isActive: link.is_active,
        createdAt: link.created_at,
        clickCount: parseInt(link.click_count, 10),
      },
    });
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({
      error: 'Server error while fetching link.',
    });
  }
}

/**
 * Update a link
 */
async function updateLink(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { originalUrl, expiresAt, isActive } = req.body;

    // Check if link exists and belongs to user
    const linkCheck = await pool.query(
      'SELECT id FROM links WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (linkCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Link not found.',
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (originalUrl !== undefined) {
      if (!validateUrl(originalUrl)) {
        return res.status(400).json({
          error: 'Invalid URL format.',
        });
      }
      updates.push(`original_url = $${paramCount}`);
      values.push(originalUrl);
      paramCount++;
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null) {
        updates.push(`expires_at = NULL`);
      } else {
        const expirationDate = new Date(expiresAt);

        if (isNaN(expirationDate.getTime())) {
          return res.status(400).json({
            error: 'Invalid expiration date format.',
          });
        }

        updates.push(`expires_at = $${paramCount}`);
        values.push(expirationDate);
        paramCount++;
      }
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(isActive);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No updates provided.',
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const result = await pool.query(
      `UPDATE links
       SET ${updates.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING id, original_url, short_code, expires_at, is_active, created_at`,
      values
    );

    const link = result.rows[0];

    res.json({
      message: 'Link updated successfully.',
      link: {
        id: link.id,
        originalUrl: link.original_url,
        shortCode: link.short_code,
        shortUrl: `${process.env.BASE_URL}/${link.short_code}`,
        expiresAt: link.expires_at,
        isActive: link.is_active,
        createdAt: link.created_at,
      },
    });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({
      error: 'Server error while updating link.',
    });
  }
}

/**
 * Delete a link
 */
async function deleteLink(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Soft delete by setting is_active to false
    const result = await pool.query(
      'UPDATE links SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Link not found.',
      });
    }

    res.json({
      message: 'Link deleted successfully.',
    });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({
      error: 'Server error while deleting link.',
    });
  }
}

module.exports = {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
};
