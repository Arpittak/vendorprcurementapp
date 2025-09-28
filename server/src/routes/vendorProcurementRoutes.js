const express = require('express');
const VendorProcurementController = require('../controllers/vendorProcurementController');
const PDFController = require('../controllers/pdfController');

const router = express.Router();

// Vendor routes
router.get('/vendors', VendorProcurementController.getVendorsList);
router.get('/vendors/:id', VendorProcurementController.getVendorDetails);
router.get('/vendors/:id/items', VendorProcurementController.getVendorProcurementItems);

// Filter options routes
router.get('/filter-options', VendorProcurementController.getFilterOptions);
router.get('/stones/names', VendorProcurementController.getStoneNames);

// PDF generation routes
router.post('/pdf', PDFController.generateVendorProcurementPDF);

module.exports = router;