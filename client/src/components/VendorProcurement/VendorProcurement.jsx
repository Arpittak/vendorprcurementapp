import React, {  useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { useProcurement, useFilters, useFilterOptions } from '../../hooks/useProcurement';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { validateDateRange } from '../../utils/validators';
import { MESSAGES } from '../../utils/constants';
import Pagination from '../common/Pagination';
import ProcurementHeader from './ProcurementHeader';
import ProcurementFilters from './ProcurementFilters';
import ProcurementStats from './ProcurementStats';
import ProcurementTable from './ProcurementTable';
import DownloadButton from './DownloadButton';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import './VendorProcurement.css';


const VendorProcurement = ({ vendor, onBack }) => {
  const { items, stats, pagination, loading, error, setError, fetchItems } = useProcurement(vendor.id);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { filters, updateFilter, clearFilters, setFilters } = useFilters();
  const { filterOptions, stoneNames, fetchStoneNames } = useFilterOptions();
  const { loading: pdfLoading, error: pdfError, generatePdf } = usePdfDownload(vendor, filters, items);


  // Fetch stone names when stone type changes
  useEffect(() => {
    if (filters.stoneType) {
      fetchStoneNames(filters.stoneType);
    }
  }, [filters.stoneType, fetchStoneNames]);

  // Handle filter changes
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
  setCurrentPage(1); // Reset to page 1
  fetchItems(updatedFilters, 1, itemsPerPage);
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
  setCurrentPage(1); // Reset to page 1
  fetchItems(clearedFilters, 1, itemsPerPage);
};

const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
  fetchItems(filters, newPage, itemsPerPage);
};

const handleLimitChange = (newLimit) => {
  setItemsPerPage(newLimit);
  setCurrentPage(1);
  fetchItems(filters, 1, newLimit);
};
  return (
    <div className="vendor-procurement">
      <ProcurementHeader vendor={vendor} onBack={onBack} />

      <ProcurementFilters
        filters={filters}
        filterOptions={filterOptions}
        stoneNames={stoneNames}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      {!loading && items.length > 0 && (
  <ProcurementStats items={items} stats={stats} totalItems={pagination.totalItems} />
)}

      {!loading && items.length > 0 && (
        <DownloadButton
          loading={pdfLoading}
          onClick={generatePdf}
        />
      )}

      <ErrorMessage message={error || pdfError} />

      {loading && <LoadingState message={MESSAGES.INFO.LOADING_ITEMS} />}

      {!loading && items.length > 0 && (
  <>
    <ProcurementTable 
      items={items} 
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      totalItems={pagination.totalItems}
    />
    <Pagination
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      itemsPerPage={pagination.itemsPerPage}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
      limitOptions={[10, 25, 50, 100]}
      disabled={loading}
    />
  </>
)}
      {!loading && items.length === 0 && (
        <EmptyState
          icon={<Package size={48} />}
          title={MESSAGES.INFO.NO_ITEMS}
          message="Try adjusting your filter criteria or check if this vendor has any procurement records."
        />
      )}
    </div>
  );
};

export default VendorProcurement;