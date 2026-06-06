const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getSecret() {
  return process.env.JWT_SECRET || 'parapublic-dev-secret';
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    getSecret(),
    { expiresIn: '7d' }
  );
}

async function authOptional(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) return next();
  try {
    const payload = jwt.verify(hdr.slice(7), getSecret());
    const user = await User.findById(payload.id);
    if (user?.isActive) {
      req.user = user;
      req.auth = payload;
    }
  } catch {
    /* ignore */
  }
  next();
}

async function authRequired(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(hdr.slice(7), getSecret());
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (res.headersSent) return;
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    next();
  });
}

function mapUser(u) {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || '',
    isActive: u.isActive,
    createdAt: u.createdAt,
  };
}

module.exports = { signToken, authOptional, authRequired, adminRequired, mapUser };
