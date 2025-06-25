import { forwardRef } from 'react';

const TextArea = forwardRef(({ 
  label, 
  error, 
  helperText, 
  rows = 3,
  className = '', 
  ...props 
}, ref) => {
  const textareaClasses = `w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
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
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
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

TextArea.displayName = 'TextArea';

export default TextArea;