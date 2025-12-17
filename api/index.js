// api/index.js - Entry point untuk Vercel serverless (CommonJS)
const app = require("../dist/server.js");

// Handle export default vs module.exports
module.exports = app.default ?? app;
