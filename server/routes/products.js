const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { adminRequired } = require('../middleware/auth');
const { mapProduct } = require('../utils/mappers');
const { adjustStock } = require('../services/stock');
const { upsertProduct, removeProduct } = require('../services/productCatalog');

const router = express.Router();

function parseCategoryId(value) {
  if (!value || value === 'null' || value === 'undefined') return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return value;
}

router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active === '1';
    const filter = activeOnly ? { isActive: true } : {};
    const list = await Product.find(filter).sort({ name: 1 });
    res.json(list.map(mapProduct));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const p = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(mapProduct(p));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', adminRequired, async (req, res) => {
  try {
    const body = req.body;
    const slug =
      body.slug?.trim() ||
      body.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

    const product = await Product.create({
      categoryId: parseCategoryId(body.categoryId),
      name: body.name,
      slug,
      description: body.description || '',
      price: Number(body.price) || 0,
      compareAtPrice:
        body.compareAtPrice != null && Number(body.compareAtPrice) > 0
          ? Number(body.compareAtPrice)
          : null,
      imageUrl: body.imageUrl || '',
      stockQuantity: 0,
      lowStockThreshold: Number(body.lowStockThreshold) || 5,
      isActive: true,
    });

    const qty = Number(body.stockQuantity) || 0;
    if (qty > 0) {
      await adjustStock(product._id, 'in', qty, 'New product', req.user._id);
      const fresh = await Product.findById(product._id);
      const mapped = mapProduct(fresh);
      upsertProduct(mapped);
      return res.status(201).json(mapped);
    }

    const mapped = mapProduct(product);
    upsertProduct(mapped);
    res.status(201).json(mapped);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/toggle', adminRequired, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    p.isActive = !p.isActive;
    await p.save();
    const mapped = mapProduct(p);
    upsertProduct(mapped);
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id', adminRequired, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });

    const body = req.body;
    if (body.name != null) p.name = String(body.name).trim();
    if (body.description != null) p.description = String(body.description);
    if (body.price != null) p.price = Number(body.price) || 0;
    if (body.compareAtPrice !== undefined) {
      p.compareAtPrice =
        body.compareAtPrice != null && Number(body.compareAtPrice) > 0
          ? Number(body.compareAtPrice)
          : null;
    }
    if (body.imageUrl != null) p.imageUrl = String(body.imageUrl);
    if (body.categoryId !== undefined) p.categoryId = parseCategoryId(body.categoryId);
    if (body.lowStockThreshold != null) {
      p.lowStockThreshold = Math.max(0, Number(body.lowStockThreshold) || 0);
    }
    if (body.slug != null && String(body.slug).trim()) {
      p.slug = String(body.slug).trim();
    }

    await p.save();

    if (body.stockQuantity != null) {
      const target = Math.max(0, Number(body.stockQuantity) || 0);
      if (target !== p.stockQuantity) {
        const result = await adjustStock(
          p._id,
          'adjustment',
          target,
          body.stockNote || 'Admin stock update',
          req.user._id
        );
        if (result.error) return res.status(400).json({ error: result.error });
        const fresh = await Product.findById(p._id);
        const mapped = mapProduct(fresh);
        upsertProduct(mapped);
        return res.json(mapped);
      }
    }

    const mapped = mapProduct(p);
    upsertProduct(mapped);
    res.json(mapped);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', adminRequired, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (p) removeProduct({ id: p._id.toString(), slug: p.slug });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
