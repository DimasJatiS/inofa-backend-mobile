const db = require('../db');

exports.getAllDevelopers = async (req, res) => {
  let { skill } = req.query;

  skill = typeof skill === 'string' ? skill.trim() : null;
  if (skill === '') skill = null;

  try {
    const users = await db.user.findMany({
      where: {
        role: 'developer',
        ...(skill
          ? {
              profile: {
                is: {
                  skills: {
                    has: skill,
                  },
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            name: true,
            bio: true,
            location: true,
            skills: true,
            whatsapp: true,
            photoUrl: true,
          },
        },
      },
    });

    const data = users
      .filter((u) => u.profile)
      .map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        name: u.profile.name,
        bio: u.profile.bio,
        location: u.profile.location,
        skills: u.profile.skills || [],
        whatsapp: u.profile.whatsapp,
        photo_url: u.profile.photoUrl,
      }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

exports.searchDevelopersBySkill = async (req, res) => {
  let { skill } = req.query;

  if (!skill || typeof skill !== 'string' || skill.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Skill query is required',
    });
  }

  skill = skill.trim();

  try {
    const users = await db.user.findMany({
      where: {
        role: 'developer',
        profile: {
          is: {
            skills: {
              has: skill,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            name: true,
            bio: true,
            location: true,
            skills: true,
            whatsapp: true,
          },
        },
      },
    });

    const data = users
      .filter((u) => u.profile)
      .map((u) => {
        const whatsapp = u.profile.whatsapp || null;
        return {
          id: u.id,
          email: u.email,
          name: u.profile.name,
          bio: u.profile.bio,
          location: u.profile.location,
          skills: u.profile.skills || [],
          whatsapp,
          whatsapp_link: whatsapp ? `https://wa.me/${whatsapp}` : null,
        };
      });

    return res.json({ success: true, data });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
};


exports.getDeveloperById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid developer id' });
  }

  try {
    const user = await db.user.findFirst({
      where: { id, role: 'developer' },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            name: true,
            bio: true,
            location: true,
            skills: true,
            whatsapp: true,
            photoUrl: true,
          },
        },
        portfolios: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user || !user.profile) {
      return res.status(404).json({ success: false, message: 'Developer not found' });
    }

    const whatsapp = user.profile.whatsapp || null;

    const data = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile.name,
      bio: user.profile.bio,
      location: user.profile.location,
      skills: user.profile.skills || [],
      whatsapp,
      photo_url: user.profile.photoUrl,
      whatsapp_link: whatsapp ? `https://wa.me/${whatsapp}` : null,
      portfolio: user.portfolios || [],
    };

    return res.json({ success: true, data });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

exports.getMyDeveloperProfile = async (req, res) => {
  const userId = req.user.id;

  // pastikan role developer
  if (req.user.role !== "developer") {
    return res.status(403).json({
      success: false,
      message: "Only developers can access this endpoint"
    });
  }

  try {
    const user = await db.user.findFirst({
      where: { id: userId, role: 'developer' },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            name: true,
            bio: true,
            location: true,
            skills: true,
            whatsapp: true,
            photoUrl: true,
          },
        },
        portfolios: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const whatsapp = user.profile.whatsapp || null;

    const data = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile.name,
      bio: user.profile.bio,
      location: user.profile.location,
      skills: user.profile.skills || [],
      whatsapp,
      photo_url: user.profile.photoUrl,
      whatsapp_link: whatsapp ? `https://wa.me/${whatsapp}` : null,
      portfolio: user.portfolios || [],
    };

    return res.json({ success: true, data });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
};
