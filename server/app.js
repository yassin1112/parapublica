const path = require('path');
const express = require('express');

function createApp(options = {}) {
  const { serveStatic = true } = options;
  const app = express();
  const ROOT = path.join(__dirname, '..');

  app.use(express.json());

  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/categories', require('./routes/categories'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/stock', require('./routes/stock'));
  app.use('/api/stats', require('./routes/stats'));

  if (serveStatic) {
    app.use(express.static(ROOT));
  }

  return app;
}

module.exports = { createApp };
