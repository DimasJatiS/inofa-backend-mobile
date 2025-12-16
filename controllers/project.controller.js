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

// UPDATE PROJECT (client only)
exports.updateProject = (req, res) => {
  const userId = req.user.id;
  const projectId = req.params.id;
  let { title, description, budget, skill_requirements, constraints } = req.body;

  console.log("Update Project - Received body:", JSON.stringify(req.body, null, 2));
  console.log("Update Project - skill_requirements type:", typeof skill_requirements);
  console.log("Update Project - skill_requirements value:", skill_requirements);

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

  console.log("Update Project - userId:", userId, "projectId:", projectId);
  console.log("Update Project - skillsJSON:", skillsJSON);

  // Cek apakah project milik user ini
  const checkQuery = "SELECT id FROM projects WHERE id = ? AND user_id = ?";
  db.get(checkQuery, [projectId, userId], (err, project) => {
    if (err) {
      console.error("Update Project - checkQuery error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (!project) {
      console.log("Update Project - Project not found or not owned by user");
      return res.status(404).json({ success: false, message: "Project not found or not yours" });
    }

    console.log("Update Project - Project found:", project);

    // Update project
    const updateQuery = `
      UPDATE projects 
      SET title = ?, description = ?, budget = ?, skill_requirements = ?, constraints = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    console.log("Update Project - Executing update with params:", [title, description, budget, skillsJSON, constraints, projectId]);

    db.run(
      updateQuery,
      [title, description, budget, skillsJSON, constraints, projectId],
      function (err) {
        if (err) {
          console.error("Update Project - updateQuery error:", err);
          return res.status(500).json({ success: false, message: "Failed to update project", error: err.message });
        }
        
        console.log("Update Project - Update successful, changes:", this.changes);

        // Get updated project
        const getQuery = "SELECT * FROM projects WHERE id = ?";
        db.get(getQuery, [projectId], (err, row) => {
          if (err) {
            console.error("Update Project - getQuery error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
          }
          
          console.log("Update Project - Fetched updated project:", row);
          
          row.skill_requirements = JSON.parse(row.skill_requirements);

          return res.json({
            success: true,
            message: "Project updated successfully",
            data: row
          });
        });
      }
    );
  });
};

// DELETE PROJECT (client only)
exports.deleteProject = (req, res) => {
  const userId = req.user.id;
  const projectId = req.params.id;

  // Cek apakah project milik user ini
  const checkQuery = "SELECT id FROM projects WHERE id = ? AND user_id = ?";
  db.get(checkQuery, [projectId, userId], (err, project) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or not yours" });
    }

    // Delete project
    const deleteQuery = "DELETE FROM projects WHERE id = ?";
    db.run(deleteQuery, [projectId], function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Failed to delete project" });
      }

      return res.json({
        success: true,
        message: "Project deleted successfully"
      });
    });
  });
};

// GET PROJECT BY ID WITH CREATOR INFO (authenticated users)
exports.getProjectById = (req, res) => {
  const projectId = req.params.id;

  const query = `
    SELECT 
      p.*,
      u.email as creator_email,
      pr.name as creator_name,
      pr.bio as creator_bio,
      pr.location as creator_location,
      pr.whatsapp as creator_whatsapp,
      pr.photo_url as creator_photo_url
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN profiles pr ON p.user_id = pr.user_id
    WHERE p.id = ?
  `;

  db.get(query, [projectId], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (!row) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Parse skill requirements
    row.skill_requirements = JSON.parse(row.skill_requirements);

    // Format creator whatsapp link
    if (row.creator_whatsapp) {
      // Remove any non-digit characters
      const cleanNumber = row.creator_whatsapp.replace(/\D/g, '');
      // Add country code if not present
      const whatsappNumber = cleanNumber.startsWith('62') ? cleanNumber : '62' + cleanNumber.replace(/^0/, '');
      row.creator_whatsapp_link = `https://wa.me/${whatsappNumber}`;
    }

    return res.json({ 
      success: true, 
      data: row
    });
  });
};

// UPDATE PROJECT STATUS (client only)
exports.updateProjectStatus = (req, res) => {
  const userId = req.user.id;
  const projectId = req.params.id;
  const { status } = req.body;

  console.log("Update Project Status - userId:", userId, "projectId:", projectId, "status:", status);

  // Validasi status
  const validStatuses = ['pending', 'accepted', 'rejected', 'done'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid status. Must be one of: pending, accepted, rejected, done" 
    });
  }

  // Cek apakah project milik user ini
  const checkQuery = "SELECT id FROM projects WHERE id = ? AND user_id = ?";
  db.get(checkQuery, [projectId, userId], (err, project) => {
    if (err) {
      console.error("Update Project Status - checkQuery error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or not yours" });
    }

    // Update status
    const updateQuery = "UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    db.run(updateQuery, [status, projectId], function (err) {
      if (err) {
        console.error("Update Project Status - updateQuery error:", err);
        return res.status(500).json({ success: false, message: "Failed to update project status" });
      }

      // Get updated project
      const getQuery = "SELECT * FROM projects WHERE id = ?";
      db.get(getQuery, [projectId], (err, row) => {
        if (err) {
          console.error("Update Project Status - getQuery error:", err);
          return res.status(500).json({ success: false, message: "Database error" });
        }
        
        row.skill_requirements = JSON.parse(row.skill_requirements);

        return res.json({
          success: true,
          message: "Project status updated successfully",
          data: row
        });
      });
    });
  });
};
