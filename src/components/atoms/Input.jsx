import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}, ref) => {
  const inputClasses = `w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
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
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;