import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ onSearch, onAdvancedFilter, placeholder = "Search...", className = '' }) => {
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
<div className="absolute inset-y-0 right-0 flex items-center">
          {onAdvancedFilter && (
            <button
              type="button"
              onClick={onAdvancedFilter}
              className="flex items-center px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 border-l border-gray-300"
            >
              <ApperIcon name="SlidersHorizontal" size={14} className="mr-1" />
              Advanced
            </button>
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center pr-3 hover:text-gray-700"
            >
              <ApperIcon name="X" size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default SearchBar;