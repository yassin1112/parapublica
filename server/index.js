require('dotenv').config();
const { createApp } = require('./app');
const { connectDb } = require('./config/db');

const PORT = process.env.PORT || 3000;
const app = createApp({ serveStatic: true });

async function start() {
  await connectDb();
  const server = app.listen(PORT, () => {
    console.log(`ParaPublic → http://localhost:${PORT}`);
    console.log('Run npm run seed if database is empty');
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
      console.error('   Another ParaPublic / Node server may still be running.');
      console.error('   Fix (PowerShell):');
      console.error(`     netstat -ano | findstr :${PORT}`);
      console.error('     taskkill /PID <PID> /F');
      console.error(`   Or set PORT=3001 in .env and run npm run dev again.\n`);
      process.exit(1);
    }
    throw err;
  });
}

start().catch((e) => {
  console.error('Failed to start:', e.message);
  process.exit(1);
});
