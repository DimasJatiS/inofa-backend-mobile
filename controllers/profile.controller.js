// controllers/profile.controller.js
const db = require('../db');
const { isValidWhatsapp, normalizeWhatsapp } = require('../utils/validator');

// ========================== CREATE PROFILE ==========================
exports.createProfile = (req, res) => {
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
    return res.status(400).json({
      success: false,
      message: "Skills must be array",
    });
  }
  const skillsJson = JSON.stringify(skills);

  if (whatsapp && !isValidWhatsapp(whatsapp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid WhatsApp number. Example: 6281234567890",
    });
  }

  const checkQuery = `SELECT id FROM profiles WHERE user_id = ?`;
  db.get(checkQuery, [userId], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (row) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists. Use PUT /profile.",
      });
    }

    const insertQuery = `
      INSERT INTO profiles (user_id, name, photo_url, bio, location, skills, whatsapp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertQuery,
      [userId, name, photo_url, bio, location, skillsJson, whatsapp],
      function (err) {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to create profile",
          });
        }

        return res.status(201).json({
          success: true,
          message: "Profile created successfully",
          data: {
            id: this.lastID,
            name,
            photo_url,
            bio,
            location,
            skills,
            whatsapp,
          },
        });
      }
    );
  });
};


// ========================== UPDATE PROFILE (PARTIAL UPDATE) ==========================
exports.updateProfile = (req, res) => {
  const userId = req.user.id;

  let { name, photo_url, bio, location, skills, whatsapp } = req.body;

  whatsapp = normalizeWhatsapp(whatsapp);
  whatsapp = whatsapp || null;

  if (skills !== undefined && !Array.isArray(skills)) {
    return res.status(400).json({
      success: false,
      message: "Skills must be array",
    });
  }

  const getQuery = "SELECT * FROM profiles WHERE user_id = ?";
  db.get(getQuery, [userId], (err, old) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (!old) return res.status(404).json({ success: false, message: "Profile not found" });

    const updated = {
      name: name?.trim() || old.name,
      photo_url: photo_url?.trim() || old.photo_url,
      bio: bio?.trim() || old.bio,
      location: location?.trim() || old.location,
      skills: skills ? JSON.stringify(skills) : old.skills,
      whatsapp: whatsapp !== null ? whatsapp : old.whatsapp,
    };

    if (updated.whatsapp && !isValidWhatsapp(updated.whatsapp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid WhatsApp number format",
      });
    }

    const updateQuery = `
      UPDATE profiles
      SET name = ?, photo_url = ?, bio = ?, location = ?, skills = ?, whatsapp = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

    db.run(
      updateQuery,
      [
        updated.name,
        updated.photo_url,
        updated.bio,
        updated.location,
        updated.skills,
        updated.whatsapp,
        userId,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: "Failed to update profile" });
        }

        return res.json({
          success: true,
          message: "Profile updated successfully",
        });
      }
    );
  });
};


// ========================== GET MY PROFILE ==========================
exports.getMyProfile = (req, res) => {
  const userId = req.user.id;

  const query = `SELECT * FROM profiles WHERE user_id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (!row) return res.status(404).json({ success: false, message: "Profile not found" });

    row.skills = row.skills ? JSON.parse(row.skills) : [];

    return res.json({ success: true, data: row });
  });
};


// ========================== DELETE PROFILE ==========================
exports.deleteProfile = (req, res) => {
  const userId = req.user.id;

  const deleteQuery = `DELETE FROM profiles WHERE user_id = ?`;

  db.run(deleteQuery, [userId], function (err) {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete profile" });

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  });
};