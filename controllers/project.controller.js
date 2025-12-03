const db = require('../db');
const { isValidURL, limitString } = require('../utils/validator');

// CREATE PROJECT (client only)
exports.createProject = (req, res) => {
  const userId = req.user.id;
  let { title, description, budget, skill_requirements, constraints } = req.body;

  // Sanitasi
  title = title?.trim();
  description = description?.trim();
  constraints = constraints?.trim();

  // Validasi utama
  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }
  if (title.length > 100) {
    return res.status(400).json({ success: false, message: "Title too long (max 100 chars)" });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ success: false, message: "Description too long (max 1000 chars)" });
  }

  if (!Array.isArray(skill_requirements)) {
    return res.status(400).json({ success: false, message: "Skill requirements must be array" });
  }
  if (skill_requirements.length === 0) {
    return res.status(400).json({ success: false, message: "Skill requirements cannot be empty" });
  }

  const skillsJSON = JSON.stringify(skill_requirements);

  // Cek apakah client sudah punya profile
  const queryProfile = "SELECT id FROM profiles WHERE user_id = ?";
  db.get(queryProfile, [userId], (err, profile) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "Complete your profile before creating project"
      });
    }

    // Insert project
    const insertQuery = `
      INSERT INTO projects (user_id, title, description, budget, skill_requirements, constraints)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertQuery,
      [userId, title, description, budget, skillsJSON, constraints],
      function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: "Failed to create project" });
        }

        return res.status(201).json({
          success: true,
          data: {
            id: this.lastID,
            title,
            description,
            budget,
            skill_requirements,
            constraints
          }
        });
      }
    );
  });
};


// GET PROJECTS OF CLIENT
exports.getMyProjects = (req, res) => {
  const userId = req.user.id;
  const query = "SELECT * FROM projects WHERE user_id = ?";

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    rows.forEach(row => {
      row.skill_requirements = JSON.parse(row.skill_requirements);
    });

    return res.json({ success: true, data: rows });
  });
};


// GET ALL PROJECTS (developer only) + FILTERING
exports.getAllProjects = (req, res) => {
  let { skill, budget_min, budget_max, keyword } = req.query;

  let baseQuery = "SELECT * FROM projects WHERE 1=1";
  const params = [];

  // keyword search
  if (keyword) {
    baseQuery += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${keyword}%`);
    params.push(`%${keyword}%`);
  }

  // budget min
  if (budget_min) {
    baseQuery += " AND budget >= ?";
    params.push(Number(budget_min));
  }

  // budget max
  if (budget_max) {
    baseQuery += " AND budget <= ?";
    params.push(Number(budget_max));
  }

  // skill filter (simple JSON LIKE)
  if (skill) {
    baseQuery += " AND skill_requirements LIKE ?";
    params.push(`%"${skill}"%`);
  }

  db.all(baseQuery, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    rows.forEach(row => {
      row.skill_requirements = JSON.parse(row.skill_requirements);
    });

    return res.json({ success: true, data: rows });
  });
};
