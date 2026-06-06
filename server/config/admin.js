/** Primary admin account (override via .env in production). */
module.exports = {
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin-para@gmail.com').toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '23698716',
};
