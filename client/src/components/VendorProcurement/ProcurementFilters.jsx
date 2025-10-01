import React from 'react';
import { Filter } from 'lucide-react';
import Button from '../common/Button';

const ProcurementFilters = ({
  filters,
  filterOptions,
  stoneNames,
  onFilterChange,
  onClearFilters,
  loading
}) => {
  return (
    <div className="filters-section">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={20} />
          <h3>Filters</h3>
        </div>

        <div className="filter-actions">
          <Button
            variant="secondary"
            onClick={onClearFilters}
            disabled={loading}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Stone Type</label>
          <select
            value={filters.stoneType || ''}
            onChange={(e) => onFilterChange('stoneType', e.target.value)}
            className="filter-input"
          >
            <option value="">All Stone Types</option>
            {filterOptions.stoneTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Stone Name</label>
          <select
            value={filters.stoneName || ''}
            onChange={(e) => onFilterChange('stoneName', e.target.value)}
            className="filter-input"
            disabled={!filters.stoneType}
          >
            <option value="">All Stone Names</option>
            {stoneNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProcurementFilters;