import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  className = ''
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="X"
                      onClick={onClose}
                      className="border-0 hover:bg-gray-100"
                    />
                  )}
                </div>
              )}
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;