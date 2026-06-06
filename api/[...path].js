/** All /api/* requests (Vercel routes subpaths here, not only /api) */
const handler = require('./index');
module.exports = handler;
module.exports.config = handler.config;
