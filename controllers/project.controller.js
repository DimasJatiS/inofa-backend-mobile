const db = require('../db');
const { isValidURL, limitString } = require('../utils/validator');

// CREATE PROJECT (client only)
exports.createProject = async (req, res) => {
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

  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Complete your profile before creating project',
      });
    }

    const created = await db.project.create({
      data: {
        userId,
        title,
        description: description || null,
        budget: budget !== undefined && budget !== null ? Number(budget) : null,
        skillRequirements: skill_requirements,
        constraints: constraints || null,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: created.id,
        user_id: created.userId,
        title: created.title,
        description: created.description,
        budget: created.budget,
        skill_requirements: created.skillRequirements || [],
        constraints: created.constraints,
        status: created.status,
        created_at: created.createdAt,
        updated_at: created.updatedAt,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};


// GET PROJECTS OF CLIENT
exports.getMyProjects = async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await db.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const data = (rows || []).map((p) => ({
      id: p.id,
      user_id: p.userId,
      title: p.title,
      description: p.description,
      budget: p.budget,
      skill_requirements: p.skillRequirements || [],
      constraints: p.constraints,
      status: p.status,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};


// GET ALL PROJECTS (developer only) + FILTERING
exports.getAllProjects = async (req, res) => {
  let { skill, budget_min, budget_max, keyword } = req.query;

  const where = {};
  if (keyword && typeof keyword === 'string' && keyword.trim() !== '') {
    const k = keyword.trim();
    where.OR = [
      { title: { contains: k, mode: 'insensitive' } },
      { description: { contains: k, mode: 'insensitive' } },
    ];
  }
  if (budget_min) {
    const bmin = Number(budget_min);
    if (!Number.isNaN(bmin)) {
      where.budget = { ...(where.budget || {}), gte: bmin };
    }
  }
  if (budget_max) {
    const bmax = Number(budget_max);
    if (!Number.isNaN(bmax)) {
      where.budget = { ...(where.budget || {}), lte: bmax };
    }
  }
  if (skill && typeof skill === 'string' && skill.trim() !== '') {
    where.skillRequirements = { has: skill.trim() };
  }

  try {
    const rows = await db.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const data = (rows || []).map((p) => ({
      id: p.id,
      user_id: p.userId,
      title: p.title,
      description: p.description,
      budget: p.budget,
      skill_requirements: p.skillRequirements || [],
      constraints: p.constraints,
      status: p.status,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// UPDATE PROJECT (client only)
exports.updateProject = async (req, res) => {
  const userId = req.user.id;
  const projectId = Number(req.params.id);
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

  console.log("Update Project - userId:", userId, "projectId:", projectId);

  try {
    const existing = await db.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found or not yours' });
    }

    const updated = await db.project.update({
      where: { id: projectId },
      data: {
        title,
        description: description || null,
        budget: budget !== undefined && budget !== null ? Number(budget) : null,
        skillRequirements: skill_requirements,
        constraints: constraints || null,
      },
    });

    return res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: updated.id,
        user_id: updated.userId,
        title: updated.title,
        description: updated.description,
        budget: updated.budget,
        skill_requirements: updated.skillRequirements || [],
        constraints: updated.constraints,
        status: updated.status,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error('Update Project Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project', error: err.message });
  }
};

// DELETE PROJECT (client only)
exports.deleteProject = async (req, res) => {
  const userId = req.user.id;
  const projectId = Number(req.params.id);

  try {
    const result = await db.project.deleteMany({ where: { id: projectId, userId } });
    if (!result || result.count === 0) {
      return res.status(404).json({ success: false, message: 'Project not found or not yours' });
    }

    return res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    console.error('Delete Project Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};

// GET PROJECT BY ID WITH CREATOR INFO (authenticated users)
exports.getProjectById = async (req, res) => {
  const projectId = Number(req.params.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid project id' });
  }

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                name: true,
                bio: true,
                location: true,
                whatsapp: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const creatorWhatsapp = project.user?.profile?.whatsapp || null;
    let creatorWhatsappLink = null;
    if (creatorWhatsapp) {
      const cleanNumber = creatorWhatsapp.replace(/\D/g, '');
      const whatsappNumber = cleanNumber.startsWith('62')
        ? cleanNumber
        : '62' + cleanNumber.replace(/^0/, '');
      creatorWhatsappLink = `https://wa.me/${whatsappNumber}`;
    }

    return res.json({
      success: true,
      data: {
        id: project.id,
        user_id: project.userId,
        title: project.title,
        description: project.description,
        budget: project.budget,
        skill_requirements: project.skillRequirements || [],
        constraints: project.constraints,
        status: project.status,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
        creator_email: project.user?.email || null,
        creator_name: project.user?.profile?.name || null,
        creator_bio: project.user?.profile?.bio || null,
        creator_location: project.user?.profile?.location || null,
        creator_whatsapp: creatorWhatsapp,
        creator_photo_url: project.user?.profile?.photoUrl || null,
        creator_whatsapp_link: creatorWhatsappLink,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// UPDATE PROJECT STATUS (client only)
exports.updateProjectStatus = async (req, res) => {
  const userId = req.user.id;
  const projectId = Number(req.params.id);
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

  try {
    const existing = await db.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found or not yours' });
    }

    const updated = await db.project.update({
      where: { id: projectId },
      data: { status },
    });

    return res.json({
      success: true,
      message: 'Project status updated successfully',
      data: {
        id: updated.id,
        user_id: updated.userId,
        title: updated.title,
        description: updated.description,
        budget: updated.budget,
        skill_requirements: updated.skillRequirements || [],
        constraints: updated.constraints,
        status: updated.status,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error('Update Project Status Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project status' });
  }
};
