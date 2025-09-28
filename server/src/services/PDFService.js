const { chromium } = require('playwright');
const { DatabaseError } = require('../utils/errors');
const { logMemoryUsage } = require('../utils/memoryMonitor');

class PDFService {

    static async generateVendorProcurementReport(data) {
        let browser = null;

        try {
             logMemoryUsage('Before PDF generation');
            // Launch browser
            browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const context = await browser.newContext();
            const page = await context.newPage();

            // Generate HTML content
            const htmlContent = PDFService.generateHTMLReport(data);

            // Set content and generate PDF
            await page.setContent(htmlContent, { waitUntil: 'networkidle' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                },
                printBackground: true
            });
            logMemoryUsage('After PDF generation');
            return pdfBuffer;

         } catch (error) {
    throw new DatabaseError(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }
    logMemoryUsage('After cleanup');
  }
}

    static generateHTMLReport({ vendor, items, stats, filters }) {
        const currentDate = new Date().toLocaleDateString();

        // Calculate totals
        let totalAmountWithGst = 0;
        items.forEach(item => {
  const itemAmount = Number(item.itemAmount || item.item_amount || 0);
  const taxPercentage = Number(item.taxPercentage || item.tax_percentage || 0);
  const gstAmount = (itemAmount * taxPercentage) / 100;
  totalAmountWithGst += itemAmount + gstAmount;
});


        // Generate filter info
        const appliedFilters = [];
        if (filters.startDate) appliedFilters.push(`From: ${filters.startDate}`);
        if (filters.endDate) appliedFilters.push(`To: ${filters.endDate}`);
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
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }
        .header .date {
          margin-top: 10px;
          color: #666;
        }
        .vendor-info {
          background-color: #f8f9fa;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 5px;
        }
        .vendor-info h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .vendor-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .vendor-details div {
          margin-bottom: 8px;
        }
        .vendor-details strong {
          color: #333;
        }
        .filters {
          background-color: #e3f2fd;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 5px;
        }
        .filters h3 {
          margin-top: 0;
          color: #1976d2;
        }
        .summary {
          background-color: #f1f8e9;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 5px;
        }
        .summary h3 {
          margin-top: 0;
          color: #388e3c;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item .value {
          font-size: 18px;
          font-weight: bold;
          color: #2e7d32;
        }
        .summary-item .label {
          font-size: 11px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
          color: #333;
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
          padding: 40px;
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
            <th>Dimensions</th>
            <th>Quantity</th>
            <th>Item Amount</th>
            <th>GST %</th>
            <th>Total Amount (After GST)</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => {
            const gstAmount = ((item.itemAmount || item.item_amount || 0) * (item.taxPercentage || item.tax_percentage || 0)) / 100;
            const totalWithGst = (item.itemAmount || item.item_amount || 0) + gstAmount;
            return `
            <tr>
              <td>${index + 1}</td>
              <td>${item.stoneName}/${item.stoneType}</td>
              <td>${item.lengthMm} x ${item.widthMm}${item.thicknessMm ? ' x ' + item.thicknessMm : ''} mm</td>
              <td>${item.quantity} ${item.units}</td>
              <td class="amount">₹${item.itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td>${item.taxPercentage || 0}%</td>
              <td class="amount">₹${totalWithGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            `;
        }).join('')}
          <tr class="total-row">
  <td colspan="6"><strong>TOTAL</strong></td>
  <td class="amount"><strong>₹${Number(totalAmountWithGst).toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></td>
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