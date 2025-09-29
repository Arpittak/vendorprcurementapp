import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Filter, Calendar, Package } from "lucide-react";
import { vendorProcurementApi } from "../../services/api";
import "./VendorProcurement.css";

const VendorProcurement = ({ vendor, onBack }) => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    stoneType: '',
    stoneName: '',
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    stoneTypes: [],
    stonesByType: {},
    allStones: [],
  });

  const [stoneNames, setStoneNames] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
    fetchProcurementItems();
  }, []);

 
  useEffect(() => {
  if (filters.stoneType) {
    fetchStoneNames(filters.stoneType);
  } else {
    setStoneNames([]);
    // Don't clear stoneName here to avoid infinite loop
  }
}, [filters.stoneType]);
  const fetchFilterOptions = async () => {
    try {
      const response = await vendorProcurementApi.getFilterOptions();
      setFilterOptions(response.data.data);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const fetchStoneNames = async (stoneType) => {
    try {
      const response = await vendorProcurementApi.getStoneNames(stoneType);
      setStoneNames(response.data.data);
    } catch (err) {
      console.error("Error fetching stone names:", err);
    }
  };

 const fetchProcurementItems = async (customFilters = null) => {
  try {

    const scrollPosition = window.scrollY;

    setLoading(true);
    setError(null);

    const filtersToUse = customFilters || filters;
    
    const cleanFilters = {};
    if (filtersToUse.startDate) cleanFilters.startDate = filtersToUse.startDate;
    if (filtersToUse.endDate) cleanFilters.endDate = filtersToUse.endDate;
    if (filtersToUse.stoneType) cleanFilters.stoneType = filtersToUse.stoneType;
    if (filtersToUse.stoneName) cleanFilters.stoneName = filtersToUse.stoneName;

    console.log('Sending filters:', cleanFilters);

    const response = await vendorProcurementApi.getVendorProcurementItems(
      vendor.id,
      cleanFilters
    );
    setItems(response.data.data.items || []);
    setStats(response.data.data.stats || {});

    // Restore scroll position after state updates
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);


  } catch (err) {
    setError("Failed to fetch procurement items. Please try again.");
    console.error("Error fetching procurement items:", err);
  } finally {
    setLoading(false);
  }
};


  const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      errors.push("End date must be after start date");
    }
  }
  return errors;
};

 const handleFilterChange = (field, value) => {
  const updatedFilters = {
    ...filters,
    [field]: value
  };
  
  // Clear stone name when stone type changes
  if (field === 'stoneType') {
    updatedFilters.stoneName = '';
  }
  
  // Validate dates
  if (field === 'startDate' || field === 'endDate') {
    const dateErrors = validateDateRange(updatedFilters.startDate, updatedFilters.endDate);
    
    if (dateErrors.length > 0) {
      setError(dateErrors.join('. '));
      return;
    } else {
      setError(null);
    }
  }
  
  setFilters(updatedFilters);
  fetchProcurementItems(updatedFilters); // Pass filters directly
};
 const handleClearFilters = () => {
  const clearedFilters = {
    startDate: '',
    endDate: '',
    stoneType: '',
    stoneName: ''
  };
  
  setFilters(clearedFilters);
  setError(null);
  
  // Pass cleared filters directly to avoid state delay
  fetchProcurementItems(clearedFilters);
};

  // Enhanced handleDownloadPDF function in VendorProcurement.jsx

const handleDownloadPDF = async () => {
  try {
    setPdfLoading(true);
    setError(null);

    // Validate date range before sending request
    const dateErrors = validateDateRange(filters.startDate, filters.endDate);
    if (dateErrors.length > 0) {
      setError(dateErrors.join('. '));
      return;
    }

    // Check if there are items to export
    if (items.length === 0) {
      setError("No items to export. Please adjust your filters.");
      return;
    }

    // Warn if too many items (might cause memory issues)
    if (items.length > 1000) {
      if (!window.confirm(`You are about to export ${items.length} items. This might take a while. Continue?`)) {
        return;
      }
    }

    const pdfData = {
      vendorId: vendor.id,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      stoneType: filters.stoneType || undefined,
      stoneName: filters.stoneName || undefined,
    };

    console.log('Generating PDF with data:', pdfData);

    const response = await vendorProcurementApi.generatePDF(pdfData);

    // Validate response
    if (!response.data || response.data.size === 0) {
      throw new Error('Empty PDF received from server');
    }

    // Create blob and download
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Generate descriptive filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const vendorName = vendor.company_name.replace(/[^a-zA-Z0-9]/g, "_");
    const filterSuffix = filters.stoneType ? `_${filters.stoneType}` : '';
    link.download = `vendor_procurement_${vendorName}${filterSuffix}_${timestamp}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log('PDF downloaded successfully');

  } catch (err) {
    console.error("PDF generation error:", err);
    
    // Extract user-friendly error message
    let errorMessage = "Failed to generate PDF. Please try again.";
    
    if (err.response?.data) {
      // If error response is JSON
      if (typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response.data.error) {
        errorMessage = err.response.data.error;
      }
    } else if (err.message) {
      if (err.message.includes('timeout')) {
        errorMessage = "PDF generation timed out. Please try with fewer items or a smaller date range.";
      } else if (err.message.includes('Network Error')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = err.message;
      }
    }
    
    setError(errorMessage);
  } finally {
    setPdfLoading(false);
  }
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const calculateTotalWithGst = (itemAmount, taxPercentage) => {
    const amount = Number(itemAmount) || 0;
    const tax = Number(taxPercentage) || 0;
    const gstAmount = (amount * tax) / 100;
    return amount + gstAmount;
  };

  return (
    <div className="vendor-procurement">
      {/* Header */}
      <div className="procurement-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Vendors
        </button>

        <div className="vendor-info">
          <h1>{vendor.company_name}</h1>
          <div className="vendor-details">
            <span>
              <strong>Contact:</strong> {vendor.contact_person || "N/A"}
            </span>
            <span>
              <strong>Phone:</strong> {vendor.phone_number || "N/A"}
            </span>
            <span>
              <strong>Email:</strong> {vendor.email_address || "N/A"}
            </span>
            <span>
              <strong>Location:</strong> {vendor.city}, {vendor.state}
            </span>
            <span>
              <strong>GST:</strong> {vendor.gst_number || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <div className="filters-title">
            <Filter size={20} />
            <h3>Filters</h3>
          </div>

          <div className="filter-actions">
            <button
              className="btn btn-secondary"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Stone Type</label>
            <select
              value={filters.stoneType || ""}
              onChange={(e) => handleFilterChange("stoneType", e.target.value)}
              className="filter-input"
            >
              <option value="">All Stone Types</option>
              {filterOptions.stoneTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Stone Name</label>
            <select
              value={filters.stoneName || ""}
              onChange={(e) => handleFilterChange("stoneName", e.target.value)}
              className="filter-input"
              disabled={!filters.stoneType}
            >
              <option value="">All Stone Names</option>
              {stoneNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && items.length > 0 && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <Package size={24} />
              <div className="stat-content">
                <div className="stat-value">{items.length}</div>
                <div className="stat-label">Total Items</div>
              </div>
            </div>

            <div className="stat-card">
              <Calendar size={24} />
              <div className="stat-content">
                <div className="stat-value">
                  {Number(stats.total_quantity || 0).toFixed(2)}
                </div>
                <div className="stat-label">Total Quantity (Sq Meter)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(stats.total_amount || 0)}
                </div>
                <div className="stat-label">Total Amount</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(
                    items.reduce((total, item) => {
                      return (
                        total +
                        calculateTotalWithGst(
                          item.itemAmount,
                          item.taxPercentage
                        )
                      );
                    }, 0)
                  )}
                </div>
                <div className="stat-label">Total with GST</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download PDF Button */}
      {!loading && items.length > 0 && (
        <div className="download-section">
          <button
            className="btn btn-primary download-btn"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
          >
            <Download size={20} />
            {pdfLoading ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading procurement items...</p>
        </div>
      )}

      {/* Items Table */}
      {!loading && items.length > 0 && (
        <div className="items-section">
          <div className="items-header">
            <h3>Procurement Items ({items.length})</h3>
          </div>

          <div className="table-container">
            <table className="items-table">
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
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="stone-info">
                        <div className="stone-name">{item.stoneName}</div>
                        <div className="stone-type">{item.stoneType}</div>
                      </div>
                    </td>
                    <td>
                      {item.lengthMm} × {item.widthMm}
                      {item.thicknessMm && ` × ${item.thicknessMm}`} mm
                    </td>
                    <td>
                      {item.quantity} {item.units}
                    </td>
                    <td className="amount">
                      {formatCurrency(item.itemAmount)}
                    </td>
                    <td>{item.taxPercentage || 0}%</td>
                    <td className="amount total-amount">
                      {formatCurrency(
                        calculateTotalWithGst(
                          item.itemAmount,
                          item.taxPercentage
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Items State */}
      {!loading && items.length === 0 && (
        <div className="no-items">
          <Package size={48} />
          <h3>No procurement items found</h3>
          <p>
            Try adjusting your filter criteria or check if this vendor has any
            procurement records.
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorProcurement;
