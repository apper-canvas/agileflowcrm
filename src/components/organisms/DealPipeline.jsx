import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/molecules/Card';
import StatusBadge from '@/components/molecules/StatusBadge';
import { toast } from 'react-toastify';

const DealPipeline = ({ deals, contacts, onUpdateStage, onEdit, onDelete }) => {
  const [draggedDeal, setDraggedDeal] = useState(null);

  const stages = [
    { id: 'lead', label: 'Lead', color: 'bg-gray-100' },
    { id: 'qualified', label: 'Qualified', color: 'bg-blue-100' },
    { id: 'proposal', label: 'Proposal', color: 'bg-yellow-100' },
    { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
    { id: 'closed-won', label: 'Closed Won', color: 'bg-green-100' },
    { id: 'closed-lost', label: 'Closed Lost', color: 'bg-red-100' }
  ];

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (draggedDeal && draggedDeal.stage !== newStage) {
      try {
        await onUpdateStage(draggedDeal.Id, newStage);
        toast.success(`Deal moved to ${stages.find(s => s.id === newStage)?.label}`);
      } catch (error) {
        toast.error('Failed to update deal stage');
      }
    }
    
    setDraggedDeal(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {stages.map((stage) => {
        const stageDeals = getDealsByStage(stage.id);
        const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className={`p-4 rounded-lg ${stage.color} mb-4`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <span className="text-sm text-gray-600">
                  {stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(stageValue)}
              </p>
            </div>

            <motion.div
              className="space-y-3"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {stageDeals.map((deal) => (
                  <motion.div
                    key={deal.Id}
                    variants={staggerItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                  >
                    <Card
                      className="p-4 cursor-move hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {deal.title}
                        </h4>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            icon="Edit"
                            onClick={() => onEdit(deal)}
                            className="border-0 hover:bg-gray-100 p-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            icon="Trash2"
                            onClick={() => onDelete(deal)}
                            className="border-0 hover:bg-red-50 hover:text-error p-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {deal.probability}%
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <ApperIcon name="User" size={12} />
                            {getContactName(deal.contactId)}
                          </div>
                          
                          {deal.expectedCloseDate && (
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Calendar" size={12} />
                              {format(new Date(deal.expectedCloseDate), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default DealPipeline;