import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 25, 50, 100],
  disabled = false
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !disabled) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (e) => {
    if (!disabled) {
      onLimitChange(parseInt(e.target.value));
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftOffset = Math.max(1, currentPage - 2);
      const rightOffset = Math.min(totalPages, currentPage + 2);
      
      if (leftOffset > 1) {
        pages.push(1);
        if (leftOffset > 2) pages.push('...');
      }
      
      for (let i = leftOffset; i <= rightOffset; i++) {
        pages.push(i);
      }
      
      if (rightOffset < totalPages) {
        if (rightOffset < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span className="pagination-text">
          Showing {startItem} to {endItem} of {totalItems} items
        </span>
        
        <div className="pagination-limit">
          <label>Items per page:</label>
          <select 
            value={itemsPerPage} 
            onChange={handleLimitChange}
            disabled={disabled}
            className="pagination-select"
          >
            {limitOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || disabled}
        >
          <ChevronsLeft size={16} />
        </button>
        
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={disabled}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
        >
          <ChevronRight size={16} />
        </button>
        
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || disabled}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;