const app = require('./src/app');
const testDb = require('./src/utils/testDb');

const PORT = process.env.PORT || 5001;

// Add graceful shutdown for PDF queue
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  const pdfQueue = require('./src/services/PDFQueue');
  await pdfQueue.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  const pdfQueue = require('./src/services/PDFQueue');
  await pdfQueue.shutdown();
  process.exit(0);
});

// Test database connection on startup
testDb().then((success) => {
  if (success) {
    app.listen(PORT, () => {
      console.log(`🚀 Vendor Procurement Server is running on port ${PORT}`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend should run on: http://localhost:5174`);
    });
  } else {
    console.log('⚠️  Server starting without database connection');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (Database offline)`);
    });
  }
});