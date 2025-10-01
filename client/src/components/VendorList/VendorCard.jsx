import React from 'react';
import { Building, MapPin, ChevronRight, Package } from 'lucide-react';

const VendorCard = ({ vendor, onClick }) => {
  return (
    <div className="vendor-card" onClick={onClick}>
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
  );
};

export default VendorCard;