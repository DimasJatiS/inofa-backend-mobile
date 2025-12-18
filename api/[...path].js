// api/[...path].js - Catch-all entry for Vercel Serverless Functions
// Ensures routes like /api/health, /api/auth/login, etc. resolve to the same Express app.
module.exports = require('./index.js');
