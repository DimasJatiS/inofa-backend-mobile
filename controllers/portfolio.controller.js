// controllers/portfolio.controller.js
const db = require('../db');
const { isValidURL, limitString } = require('../utils/validator');

exports.createPortfolio = (req, res) => {
  const userId = req.user.id;
  let { title, description, link, image_url } = req.body;

  console.log('=== CREATE PORTFOLIO ===');
  console.log('User ID:', userId);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  // Sanitasi
  title = title?.trim();
  description = description?.trim();
  link = link?.trim();
  image_url = image_url?.trim();

  console.log('After sanitization:');
  console.log('title:', title);
  console.log('description:', description);
  console.log('link:', link);
  console.log('image_url:', image_url);

  // Validasi utama
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }

  if (title.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Title too long. Maximum 500 characters.'
    });
  }

  if (description && description.length > 10000) {
    return res.status(400).json({
      success: false,
      message: 'Description too long. Maximum 10000 characters.'
    });
  }

  // Only validate link if it looks like a URL (starts with http)
  if (link && link.startsWith('http') && !isValidURL(link)) {
    console.log('ERROR: Invalid link format:', link);
    return res.status(400).json({
      success: false,
      message: 'Invalid link format. Please use a valid URL starting with http:// or https://'
    });
  }

  // Skip validation for internal upload URLs
  const isInternalUpload = image_url && image_url.includes('/uploads/');
  
  if (image_url && !isInternalUpload && !isValidURL(image_url)) {
    console.log('ERROR: Invalid image URL format:', image_url);
    console.log('URL validation test result:', isValidURL(image_url));
    return res.status(400).json({
      success: false,
      message: 'Invalid image URL format'
    });
  }

  if (link?.length > 300) {
    return res.status(400).json({
      success: false,
      message: 'Link too long. Maximum 300 characters.'
    });
  }

  if (image_url?.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Image URL too long. Maximum 500 characters.'
    });
  }

  // Cek profile dulu
  const checkProfile = 'SELECT id FROM profiles WHERE user_id = ?';

  db.get(checkProfile, [userId], (err, profile) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Complete your profile before adding portfolio'
      });
    }

    const query = `
      INSERT INTO portfolios (user_id, title, description, link, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [userId, title, description, link, image_url], function (err) {
      if (err) {
        console.error('Database error creating portfolio:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to create portfolio',
          error: err.message
        });
      }

      console.log('Portfolio created successfully! ID:', this.lastID);

      return res.status(201).json({
        success: true,
        data: {
          id: this.lastID,
          title,
          description,
          link,
          image_url
        }
      });
    });
  });
};

// GET portfolios of the authenticated developer
exports.getMyPortfolio = (req, res) => {
  const userId = req.user.id;

  const query = `SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC`;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    return res.json({ success: true, data: rows || [] });
  });
};

// GET a single portfolio by ID (must belong to the authenticated developer)
exports.getPortfolioById = (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid portfolio id' });
  }

    const query = `SELECT * FROM portfolios WHERE id = ? AND user_id = ?`;
  db.get(query, [id, userId], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
      return res.json({ success: true, data: row });
  });
};

// UPDATE a portfolio item that belongs to the authenticated developer
exports.updatePortfolio = (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  let { title, description, link, image_url } = req.body;

  console.log('=== UPDATE PORTFOLIO ===');
  console.log('User ID:', userId, 'Portfolio ID:', id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid portfolio id' });
  }

  // Sanitasi
  title = title?.trim();
  description = description?.trim();
  link = link?.trim();
  image_url = image_url?.trim();

  console.log('After sanitization:', { title, description, link, image_url });

  // Validasi utama
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }

  if (title.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Title too long. Maximum 500 characters.'
    });
  }

  if (description && description.length > 10000) {
    return res.status(400).json({
      success: false,
      message: 'Description too long. Maximum 10000 characters.'
    });
  }

  // Only validate link if it looks like a URL (starts with http)
  if (link && link.startsWith('http') && !isValidURL(link)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid link format. Please use a valid URL starting with http:// or https://'
    });
  }

  // Skip validation for internal upload URLs
  const isInternalUpload = image_url && image_url.includes('/uploads/');
  
  if (image_url && !isInternalUpload && !isValidURL(image_url)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid image URL format'
    });
  }

  if (link?.length > 300) {
    return res.status(400).json({
      success: false,
      message: 'Link too long. Maximum 300 characters.'
    });
  }

  if (image_url?.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Image URL too long. Maximum 500 characters.'
    });
  }

  // Cek apakah portfolio ada dan milik user ini
  const checkQuery = `SELECT id FROM portfolios WHERE id = ? AND user_id = ?`;
  db.get(checkQuery, [id, userId], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Update portfolio
    const updateQuery = `
      UPDATE portfolios 
      SET title = ?, description = ?, link = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    db.run(updateQuery, [title, description, link, image_url, id, userId], function (err) {
      if (err) {
        console.error('Database error updating portfolio:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to update portfolio',
          error: err.message
        });
      }

      // Ambil data terbaru
      const selectQuery = `SELECT * FROM portfolios WHERE id = ?`;
      db.get(selectQuery, [id], (err, updatedRow) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.json({
          success: true,
          data: updatedRow
        });
      });
    });
  });
};

// DELETE a portfolio item that belongs to the authenticated developer
exports.deletePortfolio = (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid portfolio id' });
  }

  const delQuery = `DELETE FROM portfolios WHERE id = ? AND user_id = ?`;
  db.run(delQuery, [id, userId], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete portfolio' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    return res.json({ success: true, message: 'Portfolio deleted successfully' });
  });
};
