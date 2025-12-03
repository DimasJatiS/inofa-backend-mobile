const db = require('../db');

exports.getAllDevelopers = (req, res) => {
  let { skill } = req.query;

  let query = `
    SELECT users.id, email, role, profiles.name, profiles.bio, profiles.location, profiles.skills, profiles.whatsapp
    FROM users
    JOIN profiles ON profiles.user_id = users.id
    WHERE users.role = 'developer'
  `;

  const params = [];

  if (skill) {
    query += " AND profiles.skills LIKE ?";
    params.push(`%"${skill}"%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    rows.forEach(row => {
      row.skills = row.skills ? JSON.parse(row.skills) : [];
    });

    return res.json({ success: true, data: rows });
  });
};

exports.searchDevelopersBySkill = (req, res) => {
  let { skill } = req.query;

  if (!skill || skill.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Skill query is required"
    });
  }

  skill = skill.trim();

  const query = `
    SELECT users.id, email, profiles.name, profiles.bio, profiles.location, profiles.skills, profiles.whatsapp
    FROM users
    JOIN profiles ON profiles.user_id = users.id
    WHERE users.role = 'developer'
      AND profiles.skills LIKE ?
  `;

  const param = [`%"${skill}"%`];

  db.all(query, param, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    rows.forEach(dev => {
        dev.skills = JSON.parse(dev.skills || "[]");

        dev.whatsapp_link = dev.whatsapp
            ? `https://wa.me/${dev.whatsapp}`
            : null;
    });

    return res.json({
      success: true,
      data: rows
    });
  });
};


exports.getDeveloperById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT users.id, email, role, profiles.name, profiles.bio, profiles.location, profiles.skills, profiles.whatsapp
    FROM users
    JOIN profiles ON profiles.user_id = users.id
    WHERE users.id = ? AND users.role = 'developer'
  `;

  db.get(query, [id], (err, dev) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (!dev) return res.status(404).json({ success: false, message: "Developer not found" });

    dev.skills = dev.skills ? JSON.parse(dev.skills) : [];

    dev.whatsapp_link = dev.whatsapp
        ? `https://wa.me/${dev.whatsapp}`
        : null;

    // Ambil portfolio developer
    const qPortfolio = "SELECT * FROM portfolios WHERE user_id = ?";
    db.all(qPortfolio, [id], (err, prt) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });

      dev.portfolio = prt;

      return res.json({ success: true, data: dev });
    });
  });
};

exports.getMyDeveloperProfile = (req, res) => {
  const userId = req.user.id;

  // pastikan role developer
  if (req.user.role !== "developer") {
    return res.status(403).json({
      success: false,
      message: "Only developers can access this endpoint"
    });
  }

  const query = `
    SELECT users.id, email, profiles.name, profiles.bio, profiles.location, profiles.skills, profiles.whatsapp
    FROM users
    JOIN profiles ON profiles.user_id = users.id
    WHERE users.id = ? AND users.role = 'developer'
  `;

  db.get(query, [userId], (err, dev) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!dev) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    dev.skills = JSON.parse(dev.skills || "[]");

    dev.whatsapp_link = dev.whatsapp
        ? `https://wa.me/${dev.whatsapp}`
        : null;

    // ambil portfolio
    const portfolioQuery = "SELECT * FROM portfolios WHERE user_id = ?";
    db.all(portfolioQuery, [userId], (err, prt) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      dev.portfolio = prt;

      return res.json({
        success: true,
        data: dev
      });
    });
  });
};
