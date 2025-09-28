const db = require('../config/db');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

class Vendor {
  constructor(data) {
    this.id = data.id;
    this.companyName = data.company_name;
    this.contactPerson = data.contact_person;
    this.phoneNumber = data.phone_number;
    this.emailAddress = data.email_address;
    this.city = data.city;
    this.state = data.state;
    this.stateCode = data.state_code;
    this.completeAddress = data.complete_address;
    this.gstNumber = data.gst_number;
    this.bankDetails = data.bank_details;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Validation methods
  static validateCompanyName(companyName) {
    if (!companyName || companyName.trim().length === 0) {
      throw new ValidationError('Company name is required');
    }
    if (companyName.length > 255) {
      throw new ValidationError('Company name must be less than 255 characters');
    }
  }

  static validateEmail(email) {
    if (email && email.length > 255) {
      throw new ValidationError('Email must be less than 255 characters');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  static validateGstNumber(gstNumber) {
    if (gstNumber && gstNumber.length !== 15) {
      throw new ValidationError('GST number must be 15 characters');
    }
  }

  // Business logic methods
  validate() {
    Vendor.validateCompanyName(this.companyName);
    Vendor.validateEmail(this.emailAddress);
    Vendor.validateGstNumber(this.gstNumber);
  }

  // Data access methods
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT id, company_name, contact_person, phone_number, 
               email_address, city, state, state_code, 
               complete_address, gst_number, bank_details,
               created_at, updated_at
        FROM vendors
      `;
      
      const conditions = [];
      const params = [];

      // Add search filter for company name
      if (filters.search) {
        conditions.push('company_name LIKE ?');
        params.push(`%${filters.search}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY company_name ASC';

      const [rows] = await db.execute(query, params);
      return rows.map(row => new Vendor(row));
    } catch (error) {
      throw new DatabaseError(`Failed to fetch vendors: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM vendors WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        throw new NotFoundError(`Vendor with id ${id} not found`);
      }

      return new Vendor(rows[0]);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch vendor: ${error.message}`);
    }
  }

  // Get basic vendor info for lists
  // Get basic vendor info for lists with procurement count
static async getVendorsList(search = '') {
  try {
    let query = `
      SELECT 
        v.id, 
        v.company_name, 
        v.city, 
        v.state,
        COUNT(pi.id) as procurement_items_count
      FROM vendors v
      LEFT JOIN procurements p ON v.id = p.vendor_id
      LEFT JOIN procurement_items pi ON p.id = pi.procurement_id
    `;
    
    const params = [];

    if (search.trim()) {
      query += ' WHERE v.company_name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' GROUP BY v.id, v.company_name, v.city, v.state ORDER BY v.company_name ASC';

    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    throw new DatabaseError(`Failed to fetch vendors list: ${error.message}`);
  }
}
  // Check if vendor has any procurements
  async hasProcurements() {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM procurements WHERE vendor_id = ?',
        [this.id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to check vendor procurements: ${error.message}`);
    }
  }
}

module.exports = Vendor;