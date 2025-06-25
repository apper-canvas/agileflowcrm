import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary/50',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/5 focus:ring-primary/50',
    danger: 'bg-error text-white hover:bg-error/90 focus:ring-error/50 shadow-sm',
    success: 'bg-success text-white hover:bg-success/90 focus:ring-success/50 shadow-sm'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
    disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`;

  const IconComponent = icon ? (
    <ApperIcon 
      name={loading ? 'Loader2' : icon} 
      size={iconSizes[size]} 
      className={loading ? 'animate-spin' : ''}
    />
  ) : null;

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {IconComponent && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>{IconComponent}</span>
      )}
      {children}
      {IconComponent && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>{IconComponent}</span>
      )}
    </motion.button>
  );
};

export default Button;