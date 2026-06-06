const express = require('express');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const { adminRequired } = require('../middleware/auth');
const { mapMovement, mapProduct } = require('../utils/mappers');
const { adjustStock } = require('../services/stock');

const router = express.Router();

router.get('/movements', adminRequired, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const list = await StockMovement.find().sort({ createdAt: -1 }).limit(limit);
    res.json(list.map(mapMovement));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/adjust', adminRequired, async (req, res) => {
  try {
    const { productId, movementType, quantity, note } = req.body;
    const result = await adjustStock(
      productId,
      movementType,
      quantity,
      note,
      req.user._id
    );
    if (result.error) return res.status(400).json({ error: result.error });
    const p = await Product.findById(productId);
    res.json({ product: mapProduct(p) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
