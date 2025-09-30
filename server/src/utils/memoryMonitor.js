const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const logMemoryUsage = (label = '') => {
  const used = process.memoryUsage();
  console.log(`Memory Usage ${label}:`);
  console.log(`  RSS: ${formatBytes(used.rss)}`);  //Resident Set Size
  console.log(`  Heap Used: ${formatBytes(used.heapUsed)}`);  //Actual memory being actively used by JavaScript objects
  console.log(`  Heap Total: ${formatBytes(used.heapTotal)}`); //Total memory Node.js has allocated for the heap,  V8 allocates more than needed for efficiency
  console.log(`  External: ${formatBytes(used.external)}`); //Memory used by C++ objects bound to JavaScript objects managed by V8 , Playwright, file operations, streams use this
  
  // Alert if over 300MB
  if (used.rss > 300 * 1024 * 1024) {
    console.warn('⚠️  Memory usage exceeds 300MB limit!');
  }
};

module.exports = { logMemoryUsage, formatBytes };