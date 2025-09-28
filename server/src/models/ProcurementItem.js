const db = require('../config/db');
const { DatabaseError } = require('../utils/errors');

class ProcurementItem {
  constructor(data) {
    this.id = data.id;
    this.procurementId = data.procurement_id;
    this.stoneId = data.stone_id;
    this.hsnCodeId = data.hsn_code_id;
    this.inventoryItemId = data.inventory_item_id;
    this.lengthMm = data.length_mm;
    this.widthMm = data.width_mm;
    this.thicknessMm = data.thickness_mm;
    this.isCalibrated = data.is_calibrated;
    this.edgesTypeId = data.edges_type_id;
    this.finishingTypeId = data.finishing_type_id;
    this.stageId = data.stage_id;
    this.quantity = data.quantity;
    this.units = data.units;
    this.rateUnit = data.rate_unit;
    this.rate = data.rate;
    this.itemAmount = data.item_amount;
    this.comments = data.comments;
    this.createdAt = data.created_at;

    // Related data
    this.stoneName = data.stone_name;
    this.stoneType = data.stone_type;
    this.taxPercentage = data.tax_percentage;
    this.vendorName = data.vendor_name;
  }

  // Calculate total amount with GST
  getTotalAmountWithGst() {
    const gstAmount = (this.itemAmount * this.taxPercentage) / 100;
    return this.itemAmount + gstAmount;
  }

  // Get formatted dimensions
  getDimensionsString() {
    const dimensions = [this.lengthMm, this.widthMm];
    if (this.thicknessMm) {
      dimensions.push(this.thicknessMm);
    }
    return dimensions.join(' x ') + ' mm';
  }

  static async findByVendorId(vendorId, filters = {}) {
    try {
      let query = `
        SELECT 
          pi.*,
          s.stone_name,
          s.stone_type,
          p.tax_percentage,
          v.company_name as vendor_name,
          p.invoice_date
        FROM procurement_items pi
        JOIN procurements p ON pi.procurement_id = p.id
        JOIN vendors v ON p.vendor_id = v.id
        JOIN stones s ON pi.stone_id = s.id
        WHERE p.vendor_id = ?
      `;
      
      const conditions = [];
      const params = [vendorId];

      // Date range filter
      if (filters.startDate) {
        conditions.push('p.invoice_date >= ?');
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push('p.invoice_date <= ?');
        params.push(filters.endDate);
      }

      // Stone type filter
      if (filters.stoneType) {
        conditions.push('s.stone_type = ?');
        params.push(filters.stoneType);
      }

      // Stone name filter
      if (filters.stoneName) {
        conditions.push('s.stone_name = ?');
        params.push(filters.stoneName);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY p.invoice_date DESC, pi.created_at DESC';

      const [rows] = await db.execute(query, params);
      return rows.map(row => new ProcurementItem(row));
    } catch (error) {
      throw new DatabaseError(`Failed to fetch procurement items: ${error.message}`);
    }
  }

 static async getStatsByVendorId(vendorId, filters = {}) {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_items,
        SUM(pi.quantity) as total_quantity,
        SUM(pi.item_amount) as total_amount,
        AVG(p.tax_percentage) as avg_tax_percentage
      FROM procurement_items pi
      JOIN procurements p ON pi.procurement_id = p.id
    `;
    
    const params = [vendorId];
    const conditions = ['p.vendor_id = ?'];

    // Apply same filters as main query
    if (filters.startDate) {
      conditions.push('p.invoice_date >= ?');
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('p.invoice_date <= ?');
      params.push(filters.endDate);
    }

    if (filters.stoneType || filters.stoneName) {
      query += ' JOIN stones s ON pi.stone_id = s.id';
      
      if (filters.stoneType) {
        conditions.push('s.stone_type = ?');
        params.push(filters.stoneType);
      }

      if (filters.stoneName) {
        conditions.push('s.stone_name = ?');
        params.push(filters.stoneName);
      }
    }

    query += ' WHERE ' + conditions.join(' AND ');

    const [rows] = await db.execute(query, params);
    return rows[0];
  } catch (error) {
    throw new DatabaseError(`Failed to fetch procurement stats: ${error.message}`);
  }
}
}

module.exports = ProcurementItem;