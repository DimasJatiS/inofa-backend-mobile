// controllers/portfolio.controller.js
const db = require('../db');
const { isValidURL, limitString } = require('../utils/validator');

exports.createPortfolio = (req, res) => {
  const userId = req.user.id;
  let { title, description, link, image_url } = req.body;

  // Sanitasi
  title = title?.trim();
  description = description?.trim();
  link = link?.trim();
  image_url = image_url?.trim();

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

  if (link && !isValidURL(link)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid link format'
    });
  }

  if (image_url && !isValidURL(image_url)) {
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
        return res.status(500).json({
          success: false,
          message: 'Failed to create portfolio'
        });
      }

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
