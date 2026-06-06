const express = require('express');
const User = require('../models/User');
const { adminRequired, mapUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', adminRequired, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(mapUser));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/toggle', adminRequired, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    if (u._id.equals(req.user._id)) {
      return res.status(400).json({ error: 'Cannot disable yourself' });
    }
    u.isActive = !u.isActive;
    await u.save();
    res.json(mapUser(u));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
