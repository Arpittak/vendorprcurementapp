// Data validation schemas for PDF generation
const VendorSchema = {
  validate: (vendor) => {
    const errors = [];
    if (!vendor.company_name) errors.push('Company name is required');
    if (!vendor.city) errors.push('City is required');
    if (!vendor.state) errors.push('State is required');
    return { isValid: errors.length === 0, errors };
  },
  
  sanitize: (vendor) => ({
    id: vendor.id || null,
    companyName: vendor.company_name || 'N/A',
    contactPerson: vendor.contact_person || 'N/A',
    phoneNumber: vendor.phone_number || 'N/A',
    emailAddress: vendor.email_address || 'N/A',
    city: vendor.city || 'N/A',
    state: vendor.state || 'N/A',
    gstNumber: vendor.gst_number || 'N/A',
    completeAddress: vendor.complete_address || 'N/A'
  })
};

const ProcurementItemSchema = {
  validate: (item) => {
    const errors = [];
    if (!item.stone_name && !item.stoneName) errors.push('Stone name is required');
    if (!item.item_amount && !item.itemAmount) errors.push('Item amount is required');
    return { isValid: errors.length === 0, errors };
  },
  
  sanitize: (item) => ({
    id: item.id || null,
    stoneName: item.stone_name || item.stoneName || 'Unknown',
    stoneType: item.stone_type || item.stoneType || 'Unknown',
    lengthMm: Number(item.length_mm || item.lengthMm || 0),
    widthMm: Number(item.width_mm || item.widthMm || 0),
    thicknessMm: Number(item.thickness_mm || item.thicknessMm || 0),
    quantity: Number(item.quantity || 0),
    units: item.units || 'Sq Meter',
    itemAmount: Number(item.item_amount || item.itemAmount || 0),
    taxPercentage: Number(item.tax_percentage || item.taxPercentage || 0)
  })
};

const StatsSchema = {
  sanitize: (stats) => ({
    totalItems: Number(stats.total_items || 0),
    totalQuantity: Number(stats.total_quantity || 0),
    totalAmount: Number(stats.total_amount || 0),
    avgTaxPercentage: Number(stats.avg_tax_percentage || 0)
  })
};

module.exports = {
  VendorSchema,
  ProcurementItemSchema,
  StatsSchema
};