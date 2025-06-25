import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  icon = 'Package', 
  title, 
  description, 
  actionLabel,
  onAction,
  className = '' 
}) => {
  const emptyStateVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  const iconBounceVariants = {
    animate: { 
      y: [0, -10, 0],
      transition: { 
        repeat: Infinity, 
        duration: 3,
        ease: "easeInOut"
      }
    }
  };

  const buttonHoverVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={emptyStateVariants}
      transition={{ duration: 0.3 }}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        variants={iconBounceVariants}
        animate="animate"
        className="mb-4"
      >
        <ApperIcon name={icon} className="w-16 h-16 text-gray-300 mx-auto" />
      </motion.div>
      
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      )}
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      
      {actionLabel && onAction && (
        <motion.div
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;