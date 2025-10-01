import { useState, useEffect, useCallback } from 'react';
import { vendorProcurementApi } from '../services/api';

export const useVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVendors = useCallback(async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await vendorProcurementApi.getVendors(search);
      setVendors(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch vendors. Please try again.');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors,
    loading,
    error,
    fetchVendors,
    refetch: fetchVendors,
  };
};