const db = require('../config/db');
const { DatabaseError } = require('../utils/errors');

class ProcurementItem {
  constructor(data) {
    // Core procurement item data
    this.id = data.id;
    this.lengthMm = data.length_mm;
    this.widthMm = data.width_mm;
    this.thicknessMm = data.thickness_mm;
    this.quantity = data.quantity;
    this.units = data.units;
    this.rate = data.rate;
    this.rateUnit = data.rate_unit;
    this.itemAmount = data.item_amount;

    // Related data from joins
    this.stoneName = data.stone_name;
    this.stoneType = data.stone_type;
    this.taxPercentage = data.tax_percentage;
    this.invoiceDate = data.invoice_date;
    this.hsnCode = data.hsn_code;
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

  static async findByVendorId(vendorId, filters = {}, pagination = {}) {
  try {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    // Build base query parts
    let whereClause = 'WHERE p.vendor_id = ?';
    const params = [vendorId];

    // Add filter conditions
    if (filters.startDate) {
      whereClause += ' AND DATE(pi.created_at) >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ' AND DATE(pi.created_at) <= ?';
      params.push(filters.endDate);
    }

    if (filters.stoneType) {
      whereClause += ' AND s.stone_type = ?';
      params.push(filters.stoneType);
    }

    if (filters.stoneName) {
      whereClause += ' AND s.stone_name = ?';
      params.push(filters.stoneName);
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM procurement_items pi
      JOIN procurements p ON pi.procurement_id = p.id
      JOIN stones s ON pi.stone_id = s.id
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, params);
    const totalItems = countResult[0].total;

    // Main query with pagination
    // Main query with pagination
const mainQuery = `
  SELECT 
    pi.id,
    pi.length_mm,
    pi.width_mm,
    pi.thickness_mm,
    pi.quantity,
    pi.units,
    pi.rate,
    pi.rate_unit,
    pi.item_amount,
    pi.created_at,
    s.stone_name,
    s.stone_type,
    p.tax_percentage,
    p.invoice_date,
    h.code as hsn_code,
    v.company_name as vendor_name
  FROM procurement_items pi
  JOIN procurements p ON pi.procurement_id = p.id
  JOIN vendors v ON p.vendor_id = v.id
  JOIN stones s ON pi.stone_id = s.id
  LEFT JOIN hsn_codes h ON pi.hsn_code_id = h.id
  ${whereClause}
  ORDER BY pi.created_at DESC, pi.id DESC
  LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
`;

const [rows] = await db.execute(mainQuery, params);

    // const mainParams = [...params, parseInt(limit), parseInt(offset)];
    // const [rows] = await db.execute(mainQuery, mainParams);
    
    return {
      items: rows.map(row => new ProcurementItem(row)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPreviousPage: page > 1
      }
    };
  } catch (error) {
    console.error('Database error details:', error);
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