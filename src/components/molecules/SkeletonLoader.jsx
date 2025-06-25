import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 1, type = 'default', className = '' }) => {
  const skeletonTypes = {
    default: (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    ),
    card: (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    ),
    table: (
      <div className="space-y-2">
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
        </div>
      </div>
    )
  };

  const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial="hidden"
          animate="visible"
          variants={staggerItemVariants}
          transition={{ delay: index * 0.1 }}
        >
          {skeletonTypes[type]}
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;