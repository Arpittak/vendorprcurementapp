import React from 'react';
import { Search } from 'lucide-react';
import './SearchBox.css';

const SearchBox = ({ value, onChange, placeholder, disabled = false }) => {
  return (
    <div className="search-box">
      <Search size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default SearchBox;