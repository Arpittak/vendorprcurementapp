import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import VendorList from './components/VendorList/VendorList';
import VendorProcurement from './components/VendorProcurement/VendorProcurement';
import './App.css';

function App() {
  const [selectedVendor, setSelectedVendor] = useState(null);

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handleBackToList = () => {
    setSelectedVendor(null);
  };

  return (
    <Layout>
      <div className="app-container">
        {!selectedVendor ? (
          <VendorList onVendorSelect={handleVendorSelect} />
        ) : (
          <VendorProcurement 
            vendor={selectedVendor} 
            onBack={handleBackToList}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;