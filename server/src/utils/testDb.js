const db = require('../config/db');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const [rows] = await db.execute('SELECT 1 + 1 as result');
    console.log('✅ Database connection successful');
    
    // Test if tables exist
    const [vendors] = await db.execute('SELECT COUNT(*) as count FROM vendors');
    console.log(`📊 Found ${vendors[0].count} vendors in database`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure MySQL is running and database "factodb" exists');
    return false;
  }
}

module.exports = testDatabaseConnection;