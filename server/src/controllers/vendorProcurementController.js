const Vendor = require('../models/Vendor');
const Stone = require('../models/Stone');
const ProcurementItem = require('../models/ProcurementItem');
const { ValidationError, NotFoundError } = require('../utils/errors');

class VendorProcurementController {
  
  // GET /api/vendor-procurement/vendors
  static async getVendorsList(req, res, next) {
    try {
      const { search = '' } = req.query;
      
      const vendors = await Vendor.getVendorsList(search);
      
      res.json({
        success: true,
        data: vendors,
        message: `Found ${vendors.length} vendors`
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vendor-procurement/vendors/:id
  static async getVendorDetails(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        throw new ValidationError('Valid vendor ID is required');
      }

      const vendor = await Vendor.findById(parseInt(id));
      
      res.json({
        success: true,
        data: vendor,
        message: 'Vendor details retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vendor-procurement/vendors/:id/items
  static async getVendorProcurementItems(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate, stoneType, stoneName, page, limit } = req.query;
      
      if (!id || isNaN(id)) {
        throw new ValidationError('Valid vendor ID is required');
      }

      const vendorId = parseInt(id);

      // Verify vendor exists
      await Vendor.findById(vendorId);

      // Build filters
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (stoneType) filters.stoneType = stoneType;
      if (stoneName) filters.stoneName = stoneName;

      // Pagination parameters
const pagination = {
  page: parseInt(page) || 1,
  limit: parseInt(limit) || 10
};

// Get procurement items with pagination and stats
const [result, stats] = await Promise.all([
  ProcurementItem.findByVendorId(vendorId, filters, pagination),
  ProcurementItem.getStatsByVendorId(vendorId, filters)
]);

      
      res.json({
        success: true,
        data: {
          items: result.items,
          stats,
          pagination: result.pagination,
          filters: {
            vendorId,
            startDate: startDate || null,
            endDate: endDate || null,
            stoneType: stoneType || null,
            stoneName: stoneName || null
          }
        },
        message: `Found ${result.pagination.totalItems} procurement items`
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vendor-procurement/filter-options
  static async getFilterOptions(req, res, next) {
    try {
      const [stoneTypes, stones] = await Promise.all([
        Stone.getStoneTypes(),
        Stone.findAll()
      ]);

      // Group stones by type for easier frontend consumption
      const stonesByType = {};
      stones.forEach(stone => {
        if (!stonesByType[stone.stoneType]) {
          stonesByType[stone.stoneType] = [];
        }
        stonesByType[stone.stoneType].push(stone.stoneName);
      });

      res.json({
        success: true,
        data: {
          stoneTypes,
          stonesByType,
          allStones: stones
        },
        message: 'Filter options retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vendor-procurement/stones/names
  static async getStoneNames(req, res, next) {
    try {
      const { stoneType } = req.query;
      
      const stoneNames = await Stone.getStoneNamesByType(stoneType);
      
      res.json({
        success: true,
        data: stoneNames,
        message: `Found ${stoneNames.length} stone names`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VendorProcurementController;