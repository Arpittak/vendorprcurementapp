const db = require('../config/db');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

class Procurement {
  constructor(data) {
    this.id = data.id;
    this.vendorId = data.vendor_id;
    this.invoiceDate = data.invoice_date;
    this.supplierInvoice = data.supplier_invoice;
    this.vehicleNumber = data.vehicle_number;
    this.gstType = data.gst_type;
    this.taxPercentage = data.tax_percentage;
    this.freightCharges = data.freight_charges;
    this.additionalTaxableAmount = data.additional_taxable_amount;
    this.grandTotal = data.grand_total;
    this.comments = data.comments;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findByVendorId(vendorId, filters = {}) {
    try {
      let query = `
        SELECT p.*, v.company_name as vendor_name
        FROM procurements p
        JOIN vendors v ON p.vendor_id = v.id
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

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY p.invoice_date DESC, p.created_at DESC';

      const [rows] = await db.execute(query, params);
      return rows.map(row => new Procurement(row));
    } catch (error) {
      throw new DatabaseError(`Failed to fetch procurements: ${error.message}`);
    }
  }
}

module.exports = Procurement;