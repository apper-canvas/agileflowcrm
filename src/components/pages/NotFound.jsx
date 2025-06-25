import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFound = () => {
  const navigate = useNavigate();

  const pageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  const iconBounceVariants = {
    animate: { 
      y: [0, -20, 0],
      transition: { 
        repeat: Infinity, 
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <motion.div
        variants={iconBounceVariants}
        animate="animate"
        className="mb-8"
      >
        <ApperIcon name="Search" className="w-24 h-24 text-gray-300" />
      </motion.div>
      
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex gap-4">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          icon="ArrowLeft"
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate('/')}
          icon="Home"
        >
          Go to Dashboard
        </Button>
      </div>
    </motion.div>
  );
};

export default NotFound;