import React, { useState, useEffect } from "react";
import { Search, Building, MapPin, ChevronRight, Package } from 'lucide-react';
import { vendorProcurementApi } from "../../services/api";
import "./VendorList.css";


const VendorList = ({ onVendorSelect }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async (search = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await vendorProcurementApi.getVendors(search);
      setVendors(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch vendors. Please try again.");
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);
  
  // Clear previous timeout
  if (window.searchTimeout) {
    clearTimeout(window.searchTimeout);
  }
  
  // Debounce search
  window.searchTimeout = setTimeout(() => {
    fetchVendors(value);
  }, 300);
};

  const handleVendorClick = (vendor) => {
    onVendorSelect(vendor);
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="vendor-list">
        <div className="vendor-list-header">
          <h2>Select Vendor</h2>
          <div className="search-box">
            <Search size={20} />
            <input type="text" placeholder="Search vendors..." disabled />
          </div>
        </div>
        <div className="loading">Loading vendors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-list">
        <div className="vendor-list-header">
          <h2>Select Vendor</h2>
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm||''}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="vendor-list">
      <div className="vendor-list-header">
        <h2>Select Vendor</h2>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="vendor-count">
        {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} found
      </div>

      <div className="vendors-grid">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="vendor-card"
            onClick={() => handleVendorClick(vendor)}
          >
            <div className="vendor-card-content">
              <div className="vendor-header">
                <Building size={20} className="vendor-icon" />
                <div className="vendor-details">
                  <h3 className="vendor-name">{vendor.company_name}</h3>
                  <div className="vendor-location">
                    <MapPin size={16} />
                    <span>
                      {vendor.city}, {vendor.state}
                    </span>
                  </div>
                  <div className="vendor-items">
                    <Package size={14} />
                    <span>{vendor.procurement_items_count || 0} items</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="chevron" />
            </div>
          </div>
        ))}
      </div>

      {vendors.length === 0 && !loading && (
        <div className="no-vendors">
          <Building size={48} />
          <h3>No vendors found</h3>
          <p>Try adjusting your search criteria.</p>
        </div>
      )}

      {loading && vendors.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner">Searching...</div>
        </div>
      )}
    </div>
  );
};

export default VendorList;
