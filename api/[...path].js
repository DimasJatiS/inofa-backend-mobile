// api/[...path].js - Catch-all entry for Vercel Serverless Functions
// This makes /api/* routes (e.g. /api/health, /api/auth/login) resolve to the same Express app.
module.exports = require('./index.js');
