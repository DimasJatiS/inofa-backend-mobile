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

exports.register = (req, res) => {
  const { email, password } = req.body;

  // Validasi sederhana
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Cek apakah email sudah dipakai
  const checkQuery = 'SELECT id FROM users WHERE email = ?';
  db.get(checkQuery, [email], (err, row) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (row) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashed = bcrypt.hashSync(password, SALT_ROUNDS);

    const insertQuery = `
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `;
    db.run(insertQuery, [email, hashed], function (err) {
      if (err) {
        console.error('DB Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create user' });
      }

      const newUser = {
        id: this.lastID,
        email,
        role: null,
      };

      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser,
          token,
        },
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validasi sederhana
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], (err, user) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

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
  });
};

exports.statusCheck = (req, res) => {
  const userId = req.user.id;

  // Cek role terlebih dahulu
  const roleQuery = 'SELECT role FROM users WHERE id = ?';
  db.get(roleQuery, [userId], (err, user) => {
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.role) {
      return res.json({
        success: true,
        status: "role_missing",
        role_missing: true,
        profile_missing: false,
      });
    }

    const profileQuery = 'SELECT id FROM profiles WHERE user_id = ?';
    db.get(profileQuery, [userId], (err, profile) => {
      if (!profile) {
        return res.json({
          success: true,
          status: "profile_missing",
          role_missing: false,
          profile_missing: true,
        });
      }

      return res.json({
        success: true,
        status: "ready",
        role_missing: false,
        profile_missing: false,
      });
    });
  });
};


// Set / Update role: developer / client
exports.setRole = (req, res) => {
  const { role } = req.body;

  if (!role || !['developer', 'client'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either "developer" or "client"',
    });
  }

  const userId = req.user.id;

  const updateQuery = 'UPDATE users SET role = ? WHERE id = ?';
  db.run(updateQuery, [role, userId], function (err) {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update role' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Role updated successfully',
      data: {
        id: userId,
        role,
      },
    });
  });
};

// Get user info from token
exports.me = (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT id, email, role, created_at FROM users WHERE id = ?';
  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: user,
    });
  });
};
