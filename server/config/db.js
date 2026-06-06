const mongoose = require('mongoose');
const dns = require('dns');

/** Some networks timeout on MongoDB Atlas SRV lookups on Windows. */
function useReliableDnsForAtlas() {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

function maskUri(uri) {
  return uri.replace(/\/\/([^:@]+):([^@]+)@/, '//***:***@').replace(/\/\/.*@/, '//***@');
}

function printConnectionHelp(err, uri) {
  console.error('\n❌ Cannot connect to MongoDB.');
  console.error('   URI:', maskUri(uri));

  const isSrvDns =
    err?.code === 'ECONNREFUSED' &&
    (err?.syscall === 'querySrv' || String(err?.hostname || '').includes('_mongodb._tcp'));

  if (isSrvDns) {
    console.error('\n   Cause: DNS could not resolve Atlas SRV record (common with some DNS providers).');
    console.error('   Try (pick one):');
    console.error('   • Run seed again — this app now prefers Google DNS for mongodb+srv://');
    console.error('   • Windows: set DNS to 8.8.8.8 and 8.8.4.4, then: ipconfig /flushdns');
    console.error('   • Atlas → Connect → Drivers → copy STANDARD connection string (mongodb://…)');
    console.error('     and set MONGODB_URI in .env (include database name, e.g. /parapublic)');
  } else if (err?.code === 'ECONNREFUSED' && uri.includes('127.0.0.1')) {
    console.error('\n   Cause: MongoDB is not running on this PC.');
    console.error('   • Install MongoDB Community and start the service, OR');
    console.error('   • Use MongoDB Atlas and set MONGODB_URI in .env / Vercel env vars');
  } else {
    console.error('\n   Check:');
    console.error('   • MONGODB_URI in .env (user, password, /database name)');
    console.error('   • Atlas → Network Access → allow your IP (or 0.0.0.0/0 for testing)');
    console.error('   • Atlas user has read/write on the database');
  }
  console.error('');
}

async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parapublic';

  if (uri.startsWith('mongodb+srv://')) {
    useReliableDnsForAtlas();
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!global.__mongooseCache) {
    global.__mongooseCache = { promise: null };
  }

  if (global.__mongooseCache.promise) {
    await global.__mongooseCache.promise;
    return mongoose.connection;
  }

  global.__mongooseCache.promise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 15000 })
    .then((conn) => {
      console.log('MongoDB connected:', maskUri(uri));
      return conn;
    })
    .catch((err) => {
      global.__mongooseCache.promise = null;
      printConnectionHelp(err, uri);
      throw err;
    });

  await global.__mongooseCache.promise;
  return mongoose.connection;
}

module.exports = { connectDb };
