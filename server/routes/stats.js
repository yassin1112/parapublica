const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { adminRequired } = require('../middleware/auth');

const router = express.Router();

/** Public stats for the home page (no login required) */
router.get('/home', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const clients = await User.countDocuments({ role: 'customer', isActive: true });
    const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
    res.json({
      products: products.length,
      clients,
      lowStock,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/dashboard', adminRequired, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const totalUsers = await User.countDocuments();
    const clients = await User.countDocuments({ role: 'customer' });
    const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
    const totalUnits = products.reduce((s, p) => s + p.stockQuantity, 0);
    const totalProducts = await Product.countDocuments();

    res.json({
      products: products.length,
      clients,
      lowStock,
      totalUnits,
      totalUsers,
      totalProducts,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/orders-summary', adminRequired, async (req, res) => {
  try {
    const orders = await Order.find();
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
    res.json({
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      revenue,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
