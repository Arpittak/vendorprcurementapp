// server/src/services/PDFQueue.js - Enhanced Version
class PDFQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxQueueSize = 100; // Prevent memory bloat from too many queued requests
    this.browserInstance = null; // Reuse single browser instance
    this.lastActivity = Date.now();
    this.browserTimeout = 5 * 60 * 1000; // 5 minutes browser idle timeout
    this.pdfCount = 0;
    this.maxPdfsBeforeRestart = 30;

    // Start browser cleanup timer
    this.startBrowserCleanupTimer();
  }

  async addRequest(pdfData) {
    // Check queue size to prevent memory bloat
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('PDF generation queue is full. Please try again later.');
    }

    return new Promise((resolve, reject) => {
      const request = {
        data: pdfData,
        resolve,
        reject,
        timestamp: Date.now(),
        timeout: setTimeout(() => {
          // Remove from queue if timeout
          const index = this.queue.indexOf(request);
          if (index > -1) {
            this.queue.splice(index, 1);
            reject(new Error('PDF generation request timed out'));
          }
        }, 300000) // 1 minute timeout per request
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`Starting PDF queue processing. Queue length: ${this.queue.length}`);

    try {
      // Ensure we have a browser instance
      await this.ensureBrowserInstance();

      while (this.queue.length > 0) {
        const request = this.queue.shift();

        // Clear timeout since we're processing
        if (request.timeout) {
          clearTimeout(request.timeout);
        }

        try {
          console.log(`Processing PDF request (${this.queue.length} remaining)`);

          const PDFService = require('./PDFService');

          // Add timeout promise
          const pdfPromise = PDFService.generateVendorProcurementReport(
            request.data,
            this.browserInstance
          );

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('PDF generation hung')), 30000) // 30 second timeout
          );

          const pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);

          this.lastActivity = Date.now();
          request.resolve(pdfBuffer);

          this.pdfCount++;

          // Restart browser every 40 PDFs
          if (this.pdfCount >= this.maxPdfsBeforeRestart) {
            console.log(`Restarting browser after ${this.pdfCount} PDFs...`);
            await this.browserInstance.close();
            this.browserInstance = null;
            this.pdfCount = 0;
            await this.ensureBrowserInstance();
            console.log('Browser restarted successfully');
          }

          if (global.gc) {
            global.gc();
          }

        } catch (error) {
          console.error('PDF generation error:', error);

          // If PDF hung, force restart browser
          if (error.message === 'PDF generation hung') {
            console.log('PDF hung detected - force restarting browser...');
            try {
              await this.browserInstance.close();
            } catch (e) { }
            this.browserInstance = null;
            this.pdfCount = 0;
          }

          request.reject(error);
        }
        // Small delay between requests to prevent memory spikes
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.processing = false;
      console.log('PDF queue processing completed');
    }
  }

  async ensureBrowserInstance() {
    if (!this.browserInstance || !this.browserInstance.isConnected()) {
      console.log('Creating new browser instance...');

      // Close existing browser if it exists
      if (this.browserInstance) {
        try {
          await this.browserInstance.close();
        } catch (error) {
          console.error('Error closing existing browser:', error);
        }
      }

      const { chromium } = require('playwright');

      this.browserInstance = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--memory-pressure-off', // Disable memory pressure handling
          '--max_old_space_size=256', // Limit Node.js heap to 256MB
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows'
        ],
        timeout: 30000
      });

      console.log('Browser instance created successfully');
    }
  }

  startBrowserCleanupTimer() {
    setInterval(async () => {
      // Close browser if idle for too long and no processing is happening
      if (
        this.browserInstance &&
        !this.processing &&
        this.queue.length === 0 &&
        (Date.now() - this.lastActivity) > this.browserTimeout
      ) {
        console.log('Closing idle browser instance...');
        try {
          await this.browserInstance.close();
          this.browserInstance = null;

          // Force garbage collection
          if (global.gc) {
            global.gc();
          }
        } catch (error) {
          console.error('Error closing idle browser:', error);
        }
      }
    }, 60000); // Check every minute
  }

  async shutdown() {
    console.log('Shutting down PDF queue...');

    // Clear all pending requests
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
      request.reject(new Error('Service shutting down'));
    }

    // Close browser instance
    if (this.browserInstance) {
      try {
        await this.browserInstance.close();
        this.browserInstance = null;
      } catch (error) {
        console.error('Error closing browser during shutdown:', error);
      }
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      hasBrowser: !!this.browserInstance,
      browserConnected: this.browserInstance ? this.browserInstance.isConnected() : false,
      lastActivity: this.lastActivity
    };
  }
}

// Create singleton instance
const pdfQueue = new PDFQueue();


module.exports = pdfQueue;