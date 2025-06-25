import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = forwardRef(({ 
  label, 
  error, 
  helperText, 
  options = [],
  placeholder = "Select an option",
  className = '', 
  ...props 
}, ref) => {
  const selectClasses = `w-full px-3 py-2 border rounded-lg text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none pr-8 ${
    error 
      ? 'border-error focus:border-error' 
      : 'border-gray-300 focus:border-primary'
  } ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ApperIcon name="ChevronDown" size={16} className="text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;