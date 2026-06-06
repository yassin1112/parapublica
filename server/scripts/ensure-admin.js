/**
 * Upsert primary admin in MongoDB.
 * Usage: node server/scripts/ensure-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const User = require('../models/User');

const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/admin');

async function dropStaleUserIndex() {
  const col = mongoose.connection.db.collection('users');
  let indexes;
  try {
    indexes = await col.indexes();
  } catch (e) {
    if (e.code === 26 || e.codeName === 'NamespaceNotFound') return;
    throw e;
  }
  for (const idx of indexes) {
    if (idx.key?.user !== undefined) {
      await col.dropIndex(idx.name).catch(() => {});
      console.log('Dropped stale index:', idx.name);
    }
  }
}

async function upsertAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    user.name = 'ParaPublic Admin';
    user.passwordHash = passwordHash;
    user.role = 'admin';
    user.isActive = true;
    user.phone = user.phone || '20000000';
    await user.save();
  } else {
    user = await User.create({
      name: 'ParaPublic Admin',
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      isActive: true,
      phone: '20000000',
    });
  }

  return user;
}

async function main() {
  await connectDb();
  await dropStaleUserIndex();
  const user = await upsertAdmin();
  console.log('Admin account OK:', user.email, '| role:', user.role);
  console.log('Login:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
