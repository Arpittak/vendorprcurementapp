import React from 'react';
import { Building } from 'lucide-react';
import { useVendors } from '../../hooks/useVendors';
import { useSearch } from '../../hooks/useSearch';
import { MESSAGES } from '../../utils/constants';
import VendorCard from './VendorCard';
import SearchBox from '../common/SearchBox';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import './VendorList.css';

const VendorList = ({ onVendorSelect }) => {
  const { vendors, loading, error, fetchVendors } = useVendors();
  const { searchTerm, handleSearch } = useSearch(fetchVendors);

  if (loading && vendors.length === 0) {
    return (
      <div className="vendor-list">
        <VendorListHeader searchTerm={searchTerm} onSearch={handleSearch} disabled />
        <LoadingState message={MESSAGES.INFO.LOADING_VENDORS} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-list">
        <VendorListHeader searchTerm={searchTerm} onSearch={handleSearch} />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="vendor-list">
      <VendorListHeader searchTerm={searchTerm} onSearch={handleSearch} />

      <div className="vendor-count">
        {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} found
      </div>

      <div className="vendors-grid">
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onClick={() => onVendorSelect(vendor)}
          />
        ))}
      </div>

      {vendors.length === 0 && !loading && (
        <EmptyState
          icon={<Building size={48} />}
          title={MESSAGES.INFO.NO_VENDORS}
          message="Try adjusting your search criteria."
        />
      )}

      {loading && vendors.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner">Searching...</div>
        </div>
      )}
    </div>
  );
};

const VendorListHeader = ({ searchTerm, onSearch, disabled = false }) => (
  <div className="vendor-list-header">
    <h2>Select Vendor</h2>
    <SearchBox
      value={searchTerm}
      onChange={onSearch}
      placeholder="Search vendors..."
      disabled={disabled}
    />
  </div>
);

export default VendorList;