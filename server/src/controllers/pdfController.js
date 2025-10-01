const pdfQueue = require('../services/PDFQueue');
const Vendor = require('../models/Vendor');
const ProcurementItem = require('../models/ProcurementItem');
const { ValidationError } = require('../utils/errors');

class PDFController {

  static async generateVendorProcurementPDF(req, res, next) {
    try {
      const { vendorId, startDate, endDate, stoneType, stoneName } = req.body;

      // Validation
      if (!vendorId || isNaN(vendorId)) {
        throw new ValidationError('Valid vendor ID is required');
      }

      // Verify vendor exists and get details
      const vendor = await Vendor.findById(parseInt(vendorId));

      // Build filters
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (stoneType) filters.stoneType = stoneType;
      if (stoneName) filters.stoneName = stoneName;

      // Get procurement items and stats
      const [result, stats] = await Promise.all([
        ProcurementItem.findByVendorId(vendorId, filters, { page: 1, limit: 999999 }),
        ProcurementItem.getStatsByVendorId(vendorId, filters)
      ]);

      const items = result.items;

      if (items.length === 0) {
        throw new ValidationError('No procurement items found for the specified filters');
      }

      // Add to PDF queue (sequential processing)
      const pdfBuffer = await pdfQueue.addRequest({
        vendor,
        items,
        stats,
        filters
      });

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const vendorName = vendor.companyName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `vendor_procurement_${vendorName}_${timestamp}.pdf`;

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);

    } catch (error) {
      next(error);
    }
  }

  // Optional: Get queue status endpoint
  static async getQueueStatus(req, res, next) {
    try {
      const status = pdfQueue.getQueueStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PDFController;