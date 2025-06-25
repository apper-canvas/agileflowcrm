import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Select from '@/components/atoms/Select';
import DatePicker from 'react-datepicker';

const FormField = ({ type = 'input', label, error, helperText, value, onChange, className, ...props }) => {
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return <TextArea label={label} error={error} helperText={helperText} value={value} onChange={onChange} className={className} {...props} />;
      case 'select':
        return <Select label={label} error={error} helperText={helperText} value={value} onChange={onChange} className={className} {...props} />;
      case 'datepicker':
        return (
          <div className="space-y-1">
            {label && (
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
            )}
            <DatePicker
              selected={value ? new Date(value) : null}
              onChange={(date) => {
                const event = {
                  target: {
                    value: date ? date.toISOString().split('T')[0] : ''
                  }
                };
                onChange(event);
              }}
              dateFormat="yyyy-MM-dd"
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500 dark:border-red-400' : ''} ${className || ''}`}
              wrapperClassName="w-full"
              {...props}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
          </div>
        );
      default:
        return <Input label={label} error={error} helperText={helperText} value={value} onChange={onChange} className={className} {...props} />;
    }
  };

  return renderField();
};

export default FormField;