const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { signToken, authRequired, mapUser } = require('../middleware/auth');

const router = express.Router();
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be 8+ characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer',
    });

    const token = signToken(user);
    res.status(201).json({ token, user: mapUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase(), isActive: true });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: mapUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', authRequired, (req, res) => {
  res.json({ user: mapUser(req.user) });
});

router.patch('/profile', authRequired, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (name?.trim()) req.user.name = name.trim();
    if (phone !== undefined) req.user.phone = phone.trim();
    await req.user.save();
    res.json({ user: mapUser(req.user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email, isActive: true });
    const response = {
      message: 'If this email exists, reset instructions were sent.',
    };

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await PasswordReset.deleteMany({ email });
      await PasswordReset.create({ email, token, expiresAt });

      const base = `${req.protocol}://${req.get('host')}`;
      response.resetUrl = `${base}/reset-password.html?token=${token}`;
    }

    res.json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be 8+ characters' });
    }

    const record = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (!record) return res.status(400).json({ error: 'Invalid or expired reset link' });

    const user = await User.findOne({ email: record.email, isActive: true });
    if (!user) return res.status(400).json({ error: 'Account not found' });

    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();
    record.used = true;
    await record.save();

    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
