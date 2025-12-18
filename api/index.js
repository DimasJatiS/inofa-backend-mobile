// api/index.js - Entry point untuk Vercel serverless (CommonJS)
const app = require("../dist/server.js");

// Handle export default vs module.exports
const handler = app.default ?? app;

// Vercel invokes this function for /api and /api/*.
// When using rewrites, the incoming URL can include the "/api" prefix.
// Strip it so our Express routes ("/health", "/auth", etc.) match.
module.exports = (req, res) => {
	if (req && typeof req.url === 'string') {
		while (req.url.startsWith('/api')) {
			req.url = req.url.slice(4) || '/';
		}
	}
	return handler(req, res);
};
