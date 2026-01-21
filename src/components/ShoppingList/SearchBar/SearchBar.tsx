import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  searchTerm: string;
  sortKey: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const getSortDisplayText = (sortKey: string): string => {
  switch (sortKey) {
    case 'date':
      return 'Sort by Date Added';
    case 'name':
      return 'Sort by Name';
    case 'category':
      return 'Sort by Category';
    default:
      return 'Sort by Date Added';
  }
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  sortKey,
  onSearchChange,
  onSortChange,
}) => {
  return (
    <div
      className="search-bar-container"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
        alignItems: 'stretch',
      }}
    >
      <div style={{ flex: '1 1 300px', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search all items across all lists..."
          style={{
            width: '100%',
            padding: '12px 16px 12px 44px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            backgroundColor: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '400',
            transition: 'all 0.3s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6b7280',
          }}
        >
          <Search size={18} />
        </span>
      </div>

      <select
        value={sortKey}
        onChange={(e) => onSortChange(e.target.value)}
        style={{
          padding: '12px 36px 12px 16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
          backgroundColor: 'white',
          color: '#1f2937',
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          minWidth: '180px',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#10b981';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        }}
      >
        <option value="date">{getSortDisplayText('date')}</option>
        <option value="name">{getSortDisplayText('name')}</option>
        <option value="category">{getSortDisplayText('category')}</option>
      </select>
    </div>
  );
};

export default SearchBar;
