// controllers/profile.controller.js
const db = require('../db');
const { isValidWhatsapp, normalizeWhatsapp } = require('../utils/validator');

// ========================== CREATE PROFILE ==========================
exports.createProfile = async (req, res) => {
  const userId = req.user.id;

  let { name, photo_url, bio, location, skills, whatsapp } = req.body;

  name = name?.trim();
  bio = bio?.trim() || null;
  location = location?.trim() || null;
  photo_url = photo_url?.trim() || null;

  whatsapp = normalizeWhatsapp(whatsapp);
  whatsapp = whatsapp || null;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (!Array.isArray(skills)) {
    // Terima string "a,b,c" dan konversi jadi array supaya lebih toleran
    if (typeof skills === 'string') {
      skills = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      return res.status(400).json({
        success: false,
        message: "Skills must be array",
      });
    }
  }
  if (whatsapp && !isValidWhatsapp(whatsapp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid WhatsApp number. Example: 6281234567890",
    });
  }

  try {
    const existing = await db.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Profile already exists. Use PUT /profile.',
      });
    }

    const created = await db.profile.create({
      data: {
        userId,
        name,
        photoUrl: photo_url,
        bio,
        location,
        skills,
        whatsapp,
      },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        bio: true,
        location: true,
        skills: true,
        whatsapp: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: {
        id: created.id,
        name: created.name,
        photo_url: created.photoUrl,
        bio: created.bio,
        location: created.location,
        skills: created.skills || [],
        whatsapp: created.whatsapp,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create profile',
    });
  }
};


// ========================== UPDATE PROFILE (PARTIAL UPDATE) ==========================
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;

  let { name, photo_url, bio, location, skills, whatsapp } = req.body;

  whatsapp = normalizeWhatsapp(whatsapp);
  whatsapp = whatsapp || null;

  if (skills !== undefined && !Array.isArray(skills)) {
    if (typeof skills === 'string') {
      skills = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      return res.status(400).json({
        success: false,
        message: "Skills must be array",
      });
    }
  }

  try {
    const old = await db.profile.findUnique({ where: { userId } });
    if (!old) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const updatedWhatsapp = whatsapp !== null ? whatsapp : old.whatsapp;
    if (updatedWhatsapp && !isValidWhatsapp(updatedWhatsapp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid WhatsApp number format',
      });
    }

    await db.profile.update({
      where: { userId },
      data: {
        name: name?.trim() || old.name,
        photoUrl: photo_url?.trim() || old.photoUrl,
        bio: bio?.trim() || old.bio,
        location: location?.trim() || old.location,
        ...(skills !== undefined ? { skills } : {}),
        whatsapp: updatedWhatsapp,
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};


// ========================== GET MY PROFILE ==========================
exports.getMyProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const row = await db.profile.findUnique({ where: { userId } });
    if (!row) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.json({
      success: true,
      data: {
        id: row.id,
        user_id: row.userId,
        name: row.name,
        photo_url: row.photoUrl,
        bio: row.bio,
        location: row.location,
        skills: row.skills || [],
        whatsapp: row.whatsapp,
        updated_at: row.updatedAt,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};


// ========================== DELETE PROFILE ==========================
exports.deleteProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.profile.delete({ where: { userId } });
    return res.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (err) {
    // Record not found
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
};