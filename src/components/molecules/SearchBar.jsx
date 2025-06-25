import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ onSearch, placeholder = "Search...", className = '' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <ApperIcon name="Search" size={16} className="text-gray-400" />
        </div>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700"
          >
            <ApperIcon name="X" size={16} className="text-gray-400" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;