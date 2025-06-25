import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/molecules/Card';

const ActivityTimeline = ({ activities, contacts, deals }) => {
  const getContactName = (contactId) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const getDealTitle = (dealId) => {
    if (!dealId) return null;
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.title : 'Unknown Deal';
  };

  const getActivityIcon = (type) => {
    const icons = {
      email: 'Mail',
      call: 'Phone',
      meeting: 'Users',
      note: 'FileText',
      task: 'CheckSquare',
      deal: 'Target'
    };
    return icons[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      email: 'bg-blue-100 text-blue-600',
      call: 'bg-green-100 text-green-600',
      meeting: 'bg-purple-100 text-purple-600',
      note: 'bg-yellow-100 text-yellow-600',
      task: 'bg-orange-100 text-orange-600',
      deal: 'bg-red-100 text-red-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const staggerItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const contactName = getContactName(activity.contactId);
        const dealTitle = getDealTitle(activity.dealId);

        return (
          <motion.div
            key={activity.Id}
            initial="hidden"
            animate="visible"
            variants={staggerItemVariants}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <ApperIcon name={getActivityIcon(activity.type)} size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>
                          {format(new Date(activity.timestamp), 'MMM dd, yyyy h:mm a')}
                        </span>
                        
                        {contactName && (
                          <div className="flex items-center gap-1">
                            <ApperIcon name="User" size={12} />
                            {contactName}
                          </div>
                        )}
                        
                        {dealTitle && (
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Target" size={12} />
                            {dealTitle}
                          </div>
                        )}
                      </div>
                      
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          {activity.type === 'email' && activity.metadata.subject && (
                            <div>Subject: {activity.metadata.subject}</div>
                          )}
                          {activity.type === 'call' && activity.metadata.duration && (
                            <div>Duration: {activity.metadata.duration} minutes</div>
                          )}
                          {activity.type === 'meeting' && activity.metadata.attendees && (
                            <div>Attendees: {activity.metadata.attendees}</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 uppercase tracking-wider">
                      {activity.type}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;