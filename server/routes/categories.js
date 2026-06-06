const express = require('express');
const Category = require('../models/Category');
const { mapCategory } = require('../utils/mappers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await Category.find().sort({ name: 1 });
    res.json(list.map(mapCategory));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
