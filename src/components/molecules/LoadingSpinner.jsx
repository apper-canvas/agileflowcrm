import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`inline-block ${className}`}
    >
      <ApperIcon name="Loader2" size={sizes[size]} className="text-primary" />
    </motion.div>
  );
};

export default LoadingSpinner;