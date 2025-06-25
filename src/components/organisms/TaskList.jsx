import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isAfter, startOfDay } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/molecules/StatusBadge';
import Card from '@/components/molecules/Card';

const TaskList = ({ tasks, contacts, deals, onToggleComplete, onEdit, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];

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

  const isOverdue = (task) => {
    if (task.status === 'completed') return false;
    return isAfter(startOfDay(new Date()), startOfDay(new Date(task.dueDate)));
  };

  const getTaskStatus = (task) => {
    if (isOverdue(task)) return 'overdue';
    return task.status;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(task);
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return a.title.localeCompare(b.title);
  });

  const handleToggleComplete = async (task) => {
    try {
      await onToggleComplete(task.Id);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => (
          <Button
            key={option.value}
            size="sm"
            variant={filter === option.value ? 'primary' : 'outline'}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.map((task, index) => {
          const contactName = getContactName(task.contactId);
          const dealTitle = getDealTitle(task.dealId);
          const taskStatus = getTaskStatus(task);

          return (
            <motion.div
              key={task.Id}
              initial="hidden"
              animate="visible"
              variants={staggerItemVariants}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-success border-success text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {task.status === 'completed' && (
                      <ApperIcon name="Check" size={12} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          task.status === 'completed' 
                            ? 'text-gray-500 line-through' 
                            : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h3>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Calendar" size={14} />
                            <span className={isOverdue(task) ? 'text-error font-medium' : ''}>
                              {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          
                          {contactName && (
                            <div className="flex items-center gap-1">
                              <ApperIcon name="User" size={14} />
                              {contactName}
                            </div>
                          )}
                          
                          {dealTitle && (
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Target" size={14} />
                              {dealTitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <StatusBadge status={task.priority} type="priority" />
                        <StatusBadge status={taskStatus} type="task" />
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            icon="Edit"
                            onClick={() => onEdit(task)}
                            className="border-0 hover:bg-gray-100"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            icon="Trash2"
                            onClick={() => onDelete(task)}
                            className="border-0 hover:bg-red-50 hover:text-error"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;