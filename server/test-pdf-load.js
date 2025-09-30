const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testPDFLoad() {
  console.log('Starting PDF load test with 100 concurrent requests...');
  
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  const requests = Array.from({ length: 100 }, (_, i) => {
    const params = {
      vendorId: 3,  // Change to a valid vendor ID from your DB
      // Optional filters:
      // startDate: '2025-01-01',
      // endDate: '2025-09-30',
      // stoneType: 'Limestone'
    };
    
    return axios.post(
      'http://localhost:5001/api/vendor-procurement/pdf',  // Use your port (5001)
      params,
      { 
        responseType: 'stream',
        timeout: 60000 // 60 second timeout
      }
    ).then(response => {
      const filePath = path.join(__dirname, 'test-pdfs', `output_${i}.pdf`);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(path.join(__dirname, 'test-pdfs'))) {
        fs.mkdirSync(path.join(__dirname, 'test-pdfs'));
      }
      
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          successCount++;
          console.log(`✓ Request ${i + 1}/100 completed`);
          resolve();
        });
        writer.on('error', reject);
      });
    }).catch(error => {
      failCount++;
      console.error(`✗ Request ${i + 1}/100 failed:`, error.message);
    });
  });

  await Promise.all(requests);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n--- Test Results ---');
  console.log(`Total Requests: 100`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Duration: ${duration} seconds`);
  console.log(`Average: ${(duration / 100).toFixed(2)} seconds per PDF`);
}

testPDFLoad();