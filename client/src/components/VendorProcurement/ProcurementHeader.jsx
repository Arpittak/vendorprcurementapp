import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

const ProcurementHeader = ({ vendor, onBack }) => {
  return (
    <div className="procurement-header">
      <Button
        variant="secondary"
        onClick={onBack}
        icon={<ArrowLeft size={20} />}
        className="back-button"
      >
        Back to Vendors
      </Button>

      <div className="vendor-info">
        <h1>{vendor.company_name}</h1>
        <div className="vendor-details">
          <span>
            <strong>Contact:</strong> {vendor.contact_person || 'N/A'}
          </span>
          <span>
            <strong>Phone:</strong> {vendor.phone_number || 'N/A'}
          </span>
          <span>
            <strong>Email:</strong> {vendor.email_address || 'N/A'}
          </span>
          <span>
            <strong>Location:</strong> {vendor.city}, {vendor.state}
          </span>
          <span>
            <strong>GST:</strong> {vendor.gst_number || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcurementHeader;