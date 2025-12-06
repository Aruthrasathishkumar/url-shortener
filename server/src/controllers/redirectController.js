const pool = require('../config/db');

/**
 * Handle short URL redirect
 */
async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;

    // Find link by short code
    const result = await pool.query(
      `SELECT id, original_url, expires_at, is_active
       FROM links
       WHERE short_code = $1`,
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Not Found</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: #f3f4f6;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              h1 { color: #1f2937; margin: 0 0 0.5rem; }
              p { color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404 - Link Not Found</h1>
              <p>The short link you're looking for does not exist.</p>
            </div>
          </body>
        </html>
      `);
    }

    const link = result.rows[0];

    // Check if link is active
    if (!link.is_active) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Inactive</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: #f3f4f6;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              h1 { color: #1f2937; margin: 0 0 0.5rem; }
              p { color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Inactive</h1>
              <p>This link has been deactivated by its owner.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Check if link is expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Expired</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: #f3f4f6;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              h1 { color: #1f2937; margin: 0 0 0.5rem; }
              p { color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Expired</h1>
              <p>This link has expired and is no longer available.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Log the click
    const referrer = req.get('referer') || null;
    const userAgent = req.get('user-agent') || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    await pool.query(
      `INSERT INTO clicks (link_id, referrer, user_agent, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [link.id, referrer, userAgent, ipAddress]
    );

    // Redirect to original URL
    res.redirect(302, link.original_url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server Error</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f3f4f6;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            h1 { color: #1f2937; margin: 0 0 0.5rem; }
            p { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Server Error</h1>
            <p>An error occurred while processing your request.</p>
          </div>
        </body>
      </html>
    `);
  }
}

module.exports = {
  handleRedirect,
};
