// controllers/portfolio.controller.js
const db = require('../db');
const { isValidURL, limitString } = require('../utils/validator');

exports.createPortfolio = async (req, res) => {
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

  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Complete your profile before adding portfolio',
      });
    }

    const created = await db.portfolio.create({
      data: {
        userId,
        title,
        description: description || null,
        link: link || null,
        imageUrl: image_url || null,
      },
      select: { id: true },
    });

    console.log('Portfolio created successfully! ID:', created.id);

    return res.status(201).json({
      success: true,
      data: {
        id: created.id,
        title,
        description,
        link,
        image_url,
      },
    });
  } catch (err) {
    console.error('Database error creating portfolio:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create portfolio',
      error: err.message,
    });
  }
};

// GET portfolios of the authenticated developer
exports.getMyPortfolio = async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await db.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const data = (rows || []).map((r) => ({
      id: r.id,
      user_id: r.userId,
      title: r.title,
      description: r.description,
      link: r.link,
      image_url: r.imageUrl,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// GET a single portfolio by ID (must belong to the authenticated developer)
exports.getPortfolioById = async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid portfolio id' });
  }

  try {
    const row = await db.portfolio.findFirst({
      where: { id, userId },
    });
    if (!row) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    return res.json({
      success: true,
      data: {
        id: row.id,
        user_id: row.userId,
        title: row.title,
        description: row.description,
        link: row.link,
        image_url: row.imageUrl,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// UPDATE a portfolio item that belongs to the authenticated developer
exports.updatePortfolio = async (req, res) => {
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

  try {
    const existing = await db.portfolio.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const updatedRow = await db.portfolio.update({
      where: { id },
      data: {
        title,
        description: description || null,
        link: link || null,
        imageUrl: image_url || null,
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedRow.id,
        user_id: updatedRow.userId,
        title: updatedRow.title,
        description: updatedRow.description,
        link: updatedRow.link,
        image_url: updatedRow.imageUrl,
        created_at: updatedRow.createdAt,
        updated_at: updatedRow.updatedAt,
      },
    });
  } catch (err) {
    console.error('Database error updating portfolio:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: err.message,
    });
  }
};

// DELETE a portfolio item that belongs to the authenticated developer
exports.deletePortfolio = async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid portfolio id' });
  }

  try {
    const result = await db.portfolio.deleteMany({ where: { id, userId } });
    if (!result || result.count === 0) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    return res.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete portfolio' });
  }
};
