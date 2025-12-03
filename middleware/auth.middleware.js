// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // isi payload: { id, email, role }
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
