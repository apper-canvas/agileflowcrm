import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  message = "Something went wrong", 
  onRetry,
  className = '' 
}) => {
  const errorStateVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={errorStateVariants}
      transition={{ duration: 0.3 }}
      className={`text-center py-12 ${className}`}
    >
      <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;