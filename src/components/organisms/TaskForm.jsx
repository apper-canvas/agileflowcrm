import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import taskService from '@/services/api/taskService';
import contactService from '@/services/api/contactService';
import dealService from '@/services/api/dealService';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    contactId: task?.contactId || '',
    dealId: task?.dealId || '',
    assignedTo: task?.assignedTo || 'John Doe'
  });
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contactsData, dealsData] = await Promise.all([
          contactService.getAll(),
          dealService.getAll()
        ]);
        setContacts(contactsData);
        setDeals(dealsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: `${contact.name} (${contact.company})`
  }));

  const dealOptions = deals.map(deal => ({
    value: deal.Id,
    label: deal.title
  }));

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        contactId: formData.contactId ? parseInt(formData.contactId, 10) : null,
        dealId: formData.dealId ? parseInt(formData.dealId, 10) : null,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      let result;
      if (task) {
        result = await taskService.update(task.Id, submitData);
        toast.success('Task updated successfully');
      } else {
        result = await taskService.create(submitData);
        toast.success('Task created successfully');
      }

      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Task Title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
      />

      <FormField
        type="textarea"
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
        placeholder="Enter task description"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          error={errors.dueDate}
        />
        
        <FormField
          type="select"
          label="Priority"
          value={formData.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          options={priorityOptions}
          error={errors.priority}
        />
        
        <FormField
          type="select"
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
          error={errors.status}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          type="select"
          label="Related Contact"
          value={formData.contactId}
          onChange={(e) => handleChange('contactId', e.target.value)}
          options={contactOptions}
          error={errors.contactId}
          placeholder="Select contact (optional)"
        />
        
        <FormField
          type="select"
          label="Related Deal"
          value={formData.dealId}
          onChange={(e) => handleChange('dealId', e.target.value)}
          options={dealOptions}
          error={errors.dealId}
          placeholder="Select deal (optional)"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          icon={task ? 'Save' : 'Plus'}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;