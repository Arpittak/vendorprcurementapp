import React from 'react';
import { Download } from 'lucide-react';
import Button from '../common/Button';

const DownloadButton = ({ loading, onClick }) => {
  return (
    <div className="download-section">
      <Button
        variant="primary"
        onClick={onClick}
        disabled={loading}
        icon={<Download size={20} />}
        className="download-btn"
      >
        {loading ? 'Generating PDF...' : 'Download PDF Report'}
      </Button>
    </div>
  );
};

export default DownloadButton;