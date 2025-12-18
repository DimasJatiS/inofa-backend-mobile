const app = require('../server');

function buildQueryString(query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null) continue;
        params.append(key, String(v));
      }
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

module.exports = (req, res) => {
  const path = req?.query?.path;

  if (typeof path === 'string' && path.length > 0) {
    const { path: _ignored, ...rest } = req.query || {};
    const qs = buildQueryString(rest);

    // Ensure it starts with '/'
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    req.url = `${normalizedPath}${qs}`;
  }

  return app(req, res);
};
