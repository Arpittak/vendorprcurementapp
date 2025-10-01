import { useState, useCallback, useRef, useEffect } from 'react';

export const useSearch = (onSearch, debounceMs = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const timeoutRef = useRef(null);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    onSearch('');
  }, [onSearch]);

  return {
    searchTerm,
    handleSearch,
    clearSearch,
  };
};