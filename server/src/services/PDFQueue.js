class PDFQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async addRequest(pdfData) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        data: pdfData,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      
      try {
        console.log(`Processing PDF request (${this.queue.length} remaining in queue)`);
        
        const PDFService = require('./PDFService');
        const pdfBuffer = await PDFService.generateVendorProcurementReport(request.data);
        
        request.resolve(pdfBuffer);
      } catch (error) {
        request.reject(error);
      }
    }

    this.processing = false;
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }
}

// Create singleton instance
const pdfQueue = new PDFQueue();
module.exports = pdfQueue;