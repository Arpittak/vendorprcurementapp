// Enhanced PDFService.js

const { chromium } = require('playwright');
const { DatabaseError } = require('../utils/errors');
const { logMemoryUsage } = require('../utils/memoryMonitor');

class PDFService {

  static async generateVendorProcurementReport(data, sharedBrowser = null, retryCount = 0) {
    let browser = sharedBrowser;
    let shouldCloseBrowser = false;
    const maxRetries = 1;
    let context = null;
    let page = null;

    try {
      logMemoryUsage('Before PDF generation');

      if (!browser) {
        const { chromium } = require('playwright');
        browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'],
          timeout: 30000
        });
        shouldCloseBrowser = true;
      }

      context = await browser.newContext();
      page = await context.newPage();

      // Set timeout for page operations
      page.setDefaultTimeout(30000);

      // Generate HTML content
      const htmlContent = PDFService.generateEnhancedHTMLReport(data);

      // Set content and generate PDF
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        timeout: 30000
      });

      logMemoryUsage('After PDF generation');
      return pdfBuffer;

    } catch (error) {
      console.error(`PDF generation attempt ${retryCount + 1} failed:`, error.message);

      // Retry logic for recoverable errors
      if (retryCount < maxRetries && PDFService.isRetryableError(error)) {
        console.log(`Retrying PDF generation... (${retryCount + 1}/${maxRetries})`);

        // Clean up before retry
        if (shouldCloseBrowser && browser) {
          try {
            await browser.close();
          } catch (closeError) {
            console.error('Error closing browser during retry:', closeError);
          }
        }

        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));

        return PDFService.generateVendorProcurementReport(data, null, retryCount + 1);
      }

      // Transform error to user-friendly message
      const userMessage = PDFService.getUserFriendlyError(error);
      throw new DatabaseError(userMessage);

    } finally {
      try {
        // Clean up context and page first
        if (page) await page.close();
        if (context) await context.close();

        // Only close browser if we created it (not shared)
        if (shouldCloseBrowser && browser) {
          await browser.close();
          if (global.gc) {
            global.gc();
          }
        }
      } catch (closeError) {
        console.error('Error during cleanup:', closeError);
      }
      logMemoryUsage('After cleanup');
    }
  }

  static isRetryableError(error) {
    const retryableErrors = [
      'timeout',
      'connection',
      'network',
      'ECONNRESET',
      'ENOTFOUND',
      'Target page, context or browser has been closed'
    ];

    return retryableErrors.some(errorType =>
      error.message.toLowerCase().includes(errorType.toLowerCase())
    );
  }

  static getUserFriendlyError(error) {
    if (error.message.includes('timeout')) {
      return 'PDF generation timed out. Please try again with fewer items or a smaller date range.';
    }
    if (error.message.includes('memory') || error.message.includes('allocation')) {
      return 'Not enough memory to generate PDF. Please try with a smaller date range.';
    }
    if (error.message.includes('Target page, context or browser has been closed')) {
      return 'PDF generation was interrupted. Please try again.';
    }

    return `PDF generation failed: ${error.message}. Please try again.`;
  }

  static generateEnhancedHTMLReport({ vendor, items, stats, filters }) {
    const currentDate = new Date().toLocaleDateString('en-IN');

    // Helper function for consistent calculation (DEFINE FIRST)
    function calculateTotalWithGst(itemAmount, taxPercentage) {
      const amount = Number(itemAmount) || 0;
      const tax = Number(taxPercentage) || 0;
      const gstAmount = (amount * tax) / 100;
      return amount + gstAmount;
    }

    // Calculate totals using the helper function (CALCULATE SECOND)
    let totalAmountWithGst = 0;
    items.forEach(item => {
      totalAmountWithGst += calculateTotalWithGst(item.itemAmount, item.taxPercentage);
    });

    // Generate filter info
    const appliedFilters = [];
    if (filters.startDate) appliedFilters.push(`From: ${new Date(filters.startDate).toLocaleDateString('en-IN')}`);
    if (filters.endDate) appliedFilters.push(`To: ${new Date(filters.endDate).toLocaleDateString('en-IN')}`);
    if (filters.stoneType) appliedFilters.push(`Stone Type: ${filters.stoneType}`);
    if (filters.stoneName) appliedFilters.push(`Stone Name: ${filters.stoneName}`);

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Vendor Procurement Report</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        line-height: 1.3;
        margin: 0;
        padding: 0;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #333;
        padding-bottom: 15px;
      }
      .header h1 {
        margin: 0;
        color: #333;
        font-size: 20px;
      }
      .header .date {
        margin-top: 8px;
        color: #666;
        font-size: 10px;
      }
      .vendor-info {
        background-color: #f8f9fa;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 5px;
      }
      .vendor-info h2 {
        margin-top: 0;
        color: #333;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
        font-size: 14px;
      }
      .vendor-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      .vendor-details div {
        margin-bottom: 6px;
        font-size: 10px;
      }
      .vendor-details strong {
        color: #333;
      }
      .filters {
        background-color: #e3f2fd;
        padding: 12px;
        margin-bottom: 15px;
        border-radius: 5px;
      }
      .filters h3 {
        margin-top: 0;
        color: #1976d2;
        font-size: 12px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        font-size: 9px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 6px 4px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
        font-weight: bold;
        color: #333;
        font-size: 8px;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .amount {
        text-align: right;
        font-weight: bold;
      }
      .total-row {
        background-color: #e8f5e8 !important;
        font-weight: bold;
      }
      .no-data {
        text-align: center;
        padding: 30px;
        color: #666;
      }
      @media print {
        body { margin: 0; }
        .header { page-break-after: avoid; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Vendor Procurement Report</h1>
      <div class="date">Generated on: ${currentDate}</div>
    </div>

    <div class="vendor-info">
      <h2>Vendor Information</h2>
      <div class="vendor-details">
        <div>
          <div><strong>Company Name:</strong> ${vendor.companyName || vendor.company_name || 'N/A'}</div>
          <div><strong>Contact Person:</strong> ${vendor.contactPerson || vendor.contact_person || 'N/A'}</div>
          <div><strong>Phone Number:</strong> ${vendor.phoneNumber || vendor.phone_number || 'N/A'}</div>
          <div><strong>Email ID:</strong> ${vendor.emailAddress || vendor.email_address || 'N/A'}</div>
        </div>
        <div>
          <div><strong>City:</strong> ${vendor.city || 'N/A'}</div>
          <div><strong>State:</strong> ${vendor.state || 'N/A'}</div>
          <div><strong>GST Number:</strong> ${vendor.gstNumber || vendor.gst_number || 'N/A'}</div>
          <div><strong>Complete Address:</strong> ${vendor.completeAddress || vendor.complete_address || 'N/A'}</div>
        </div>
      </div>
    </div>

    ${appliedFilters.length > 0 ? `
    <div class="filters">
      <h3>Applied Filters</h3>
      <div>${appliedFilters.join(' | ')}</div>
    </div>
    ` : ''}

    ${items.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>S.No.</th>
          <th>Stone Name/Type</th>
          <th>Dimensions (mm)</th>
          <th>Quantity</th>
          <th>Date</th>
          <th>Item Amount</th>
          <th>GST %</th>
          <th>Total (After GST)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, index) => {
      const amount = Number(item.itemAmount) || 0;
      const tax = Number(item.taxPercentage) || 0;
      const gstAmount = (amount * tax) / 100;
      const totalWithGst = amount + gstAmount;
      return `
          <tr>
            <td>${index + 1}</td>
            <td>${item.stoneName}/${item.stoneType}</td>
            <td>${item.lengthMm} x ${item.widthMm}${item.thicknessMm ? ' x ' + item.thicknessMm : ''}</td>
            <td>${item.quantity} ${item.units}</td>
            <td>${new Date(item.createdAt).toLocaleDateString('en-IN')}</td>
            <td class="amount">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>${tax}%</td>
            <td class="amount">₹${totalWithGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          `;
    }).join('')}
        <tr class="total-row">
          <td colspan="7"><strong>GRAND TOTAL</strong></td>
          <td class="amount"><strong>₹${Number(totalAmountWithGst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
        </tr>
      </tbody>
    </table>
    ` : `
    <div class="no-data">
      <h3>No procurement items found for the specified criteria</h3>
    </div>
    `}
  </body>
  </html>
  `;
  }

}

module.exports = PDFService;