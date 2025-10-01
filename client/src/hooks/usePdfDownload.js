import { useState, useCallback } from 'react';
import { vendorProcurementApi } from '../services/api';
import { validateDateRange } from '../utils/validators';
import { downloadFile } from '../utils/fileHelpers';

export const usePdfDownload = (vendor, filters, items) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePdf = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dateErrors = validateDateRange(filters.startDate, filters.endDate);
      if (dateErrors.length > 0) {
        setError(dateErrors.join('. '));
        return;
      }

      if (items.length === 0) {
        setError('No items to export. Please adjust your filters.');
        return;
      }

      if (items.length > 1000) {
        const confirmed = window.confirm(
          `You are about to export ${items.length} items. This might take a while. Continue?`
        );
        if (!confirmed) return;
      }

      const pdfData = {
        vendorId: vendor.id,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        stoneType: filters.stoneType || undefined,
        stoneName: filters.stoneName || undefined,
      };

      const response = await vendorProcurementApi.generatePDF(pdfData);

      if (!response.data || response.data.size === 0) {
        throw new Error('Empty PDF received from server');
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const vendorName = vendor.company_name.replace(/[^a-zA-Z0-9]/g, '_');
      const filterSuffix = filters.stoneType ? `_${filters.stoneType}` : '';
      const filename = `vendor_procurement_${vendorName}${filterSuffix}_${timestamp}.pdf`;

      downloadFile(response.data, filename, 'application/pdf');

      console.log('PDF downloaded successfully');
    } catch (err) {
      console.error('PDF generation error:', err);

      let errorMessage = 'Failed to generate PDF. Please try again.';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        if (err.message.includes('timeout')) {
          errorMessage = 'PDF generation timed out. Please try with fewer items.';
        } else if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [vendor, filters, items]);

  return {
    loading,
    error,
    generatePdf,
  };
};