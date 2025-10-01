import { useState, useEffect, useCallback } from 'react';
import { vendorProcurementApi } from '../services/api';
import { PAGINATION } from '../utils/constants';

export const useProcurement = (vendorId) => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const [pagination, setPagination] = useState({
    currentPage: PAGINATION.DEFAULT_PAGE,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: PAGINATION.DEFAULT_LIMIT,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const fetchItems = useCallback(async (filters = {}, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) => {
    if (!vendorId) return;

    try {
      const scrollPosition = window.scrollY;
      setLoading(true);
      setError(null);

      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});

      const response = await vendorProcurementApi.getVendorProcurementItems(
        vendorId,
        { ...cleanFilters, page, limit }
      );

      setItems(response.data.data.items || []);
      setStats(response.data.data.stats || {});
      setPagination(response.data.data.pagination || {});

      setTimeout(() => window.scrollTo(0, scrollPosition), 0);
    } catch (err) {
      setError('Failed to fetch procurement items. Please try again.');
      console.error('Error fetching procurement items:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    stats,
    pagination,
    loading,
    error,
    setError,
    fetchItems,
    refetch: fetchItems,
  };
};

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    stoneType: '',
    stoneName: '',
    ...initialFilters,
  });

  const updateFilter = useCallback((field, value) => {
    setFilters(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'stoneType') {
        updated.stoneName = '';
      }
      
      return updated;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      stoneType: '',
      stoneName: '',
    });
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    setFilters,
  };
};

export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState({
    stoneTypes: [],
    stonesByType: {},
    allStones: [],
  });
  const [stoneNames, setStoneNames] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vendorProcurementApi.getFilterOptions();
      setFilterOptions(response.data.data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStoneNames = useCallback(async (stoneType) => {
    if (!stoneType) {
      setStoneNames([]);
      return;
    }

    try {
      const response = await vendorProcurementApi.getStoneNames(stoneType);
      setStoneNames(response.data.data);
    } catch (err) {
      console.error('Error fetching stone names:', err);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    filterOptions,
    stoneNames,
    loading,
    fetchStoneNames,
  };
};