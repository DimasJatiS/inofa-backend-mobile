// api/index.js - Entry point untuk Vercel serverless (CommonJS)
const app = require("../dist/server.js");

// Handle export default vs module.exports
const handler = app.default ?? app;

// Vercel invokes this function for /api and /api/*.
// When using rewrites, the incoming URL can include the "/api" prefix.
// Strip it so our Express routes ("/health", "/auth", etc.) match.
module.exports = (req, res) => {
	if (req && typeof req.url === 'string') {
		// If Vercel rewrites everything into /api, we pass the intended path
		// through a query string: /api?path=/v1/health
		try {
			const parsed = new URL(req.url, 'http://localhost');
			const forcedPath = parsed.searchParams.get('path');
			if (forcedPath) {
				parsed.searchParams.delete('path');
				const rest = parsed.searchParams.toString();
				req.url = forcedPath + (rest ? `?${rest}` : '');
			} else {
				// Backward compatibility: if URL still contains /api prefix, strip it.
				while (req.url.startsWith('/api')) {
					req.url = req.url.slice(4) || '/';
				}
			}
		} catch {
			// If parsing fails for any reason, fall back to the old behavior.
			while (req.url.startsWith('/api')) {
				req.url = req.url.slice(4) || '/';
			}
		}
	}
	return handler(req, res);
};
