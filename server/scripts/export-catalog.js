/**
 * Export all MongoDB products to data/products-catalog.json
 * Run: node server/scripts/export-catalog.js
 */
require('dotenv').config();
const { connectDb } = require('../config/db');
const Product = require('../models/Product');
const { replaceAll } = require('../services/productCatalog');
const { mapProduct } = require('../utils/mappers');

async function main() {
  await connectDb();
  const list = await Product.find().sort({ name: 1 });
  replaceAll(list.map(mapProduct));
  console.log(`Exported ${list.length} products → data/products-catalog.json`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
