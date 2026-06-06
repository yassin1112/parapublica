const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authOptional, authRequired, adminRequired } = require('../middleware/auth');
const { mapOrder } = require('../utils/mappers');
const { adjustStock } = require('../services/stock');

const DELIVERY_FEE = 8;
const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter = {
        $or: [{ userId: req.user._id }, { email: req.user.email.toLowerCase() }],
      };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders.map(mapOrder));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/track', async (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId || !email) {
      return res.status(400).json({ error: 'orderId and email required' });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = await Order.findOne({
      _id: orderId,
      email: String(email).trim().toLowerCase(),
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: mapOrder(order) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/all', adminRequired, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(mapOrder));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/status', adminRequired, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    order.status = req.body.status;
    await order.save();
    res.json(mapOrder(order));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authOptional, async (req, res) => {
  try {
    const { firstName, lastName, phone, email, address, items, paymentMethod, deliveryNote } =
      req.body;

    if (!items?.length) return res.status(400).json({ error: 'Cart is empty' });

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const pid = String(item.productId);
      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ error: 'Invalid product in cart' });
      }
      const p = await Product.findOne({ _id: pid, isActive: true });
      if (!p) return res.status(400).json({ error: 'Product unavailable' });
      const qty = Math.max(1, Number(item.quantity) || 1);
      if (p.stockQuantity < qty) {
        return res.status(400).json({ error: `Insufficient stock: ${p.name}` });
      }
      orderItems.push({
        productId: p._id,
        name: p.name,
        quantity: qty,
        unitPrice: p.price,
      });
      subtotal += p.price * qty;
    }

    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      userId: req.user?._id || null,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      currency: 'TND',
      paymentMethod: paymentMethod || '',
      deliveryNote: deliveryNote || '',
      status: 'pending',
    });

    for (const item of orderItems) {
      const result = await adjustStock(
        item.productId,
        'sale',
        item.quantity,
        `Order #${order._id.toString().slice(-6)}`,
        req.user?._id
      );
      if (result.error) return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ order: mapOrder(order) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
