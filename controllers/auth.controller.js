// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // bisa diatur sesuai kebutuhan
  );
}

exports.register = async (req, res) => {
  const { email, password, role } = req.body;

  // Validasi sederhana
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Validasi role jika diberikan
  if (role && !['developer', 'client'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either "developer" or "client"',
    });
  }

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashed = bcrypt.hashSync(password, SALT_ROUNDS);

    const created = await db.user.create({
      data: {
        email,
        password: hashed,
        role: role || null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const token = generateToken(created);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: created,
        token,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi sederhana
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

exports.statusCheck = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.role) {
      return res.json({
        success: true,
        status: 'role_missing',
        role_missing: true,
        profile_missing: false,
      });
    }

    const profile = await db.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return res.json({
        success: true,
        status: 'profile_missing',
        role_missing: false,
        profile_missing: true,
      });
    }

    return res.json({
      success: true,
      status: 'ready',
      role_missing: false,
      profile_missing: false,
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};


// Set / Update role: developer / client
exports.setRole = async (req, res) => {
  const { role } = req.body;

  if (!role || !['developer', 'client'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either "developer" or "client"',
    });
  }

  const userId = req.user.id;

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    const token = generateToken(updated);

    return res.json({
      success: true,
      message: 'Role updated successfully',
      data: {
        user: updated,
        token,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    // Prisma throws if record not found
    return res.status(404).json({ success: false, message: 'User not found' });
  }
};

// Get user info from token
exports.me = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};
