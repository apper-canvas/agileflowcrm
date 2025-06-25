import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import dealService from '@/services/api/dealService';
import contactService from '@/services/api/contactService';

const DealForm = ({ deal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    value: deal?.value || '',
    stage: deal?.stage || 'lead',
    contactId: deal?.contactId || '',
    probability: deal?.probability || 25,
    expectedCloseDate: deal?.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});

  const stageOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactsData = await contactService.getAll();
        setContacts(contactsData);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      }
    };
    loadContacts();
  }, []);

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: `${contact.name} (${contact.company})`
  }));

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }
    
    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required';
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
        value: parseFloat(formData.value),
        contactId: parseInt(formData.contactId, 10),
        probability: parseInt(formData.probability, 10),
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString() : null
      };

      let result;
      if (deal) {
        result = await dealService.update(deal.Id, submitData);
        toast.success('Deal updated successfully');
      } else {
        result = await dealService.create(submitData);
        toast.success('Deal created successfully');
      }

      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save deal');
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
        label="Deal Title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="Enter deal title"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Value ($)"
          type="number"
          value={formData.value}
          onChange={(e) => handleChange('value', e.target.value)}
          error={errors.value}
          placeholder="Enter deal value"
          min="0"
          step="0.01"
        />
        
        <FormField
          label="Probability (%)"
          type="number"
          value={formData.probability}
          onChange={(e) => handleChange('probability', e.target.value)}
          error={errors.probability}
          placeholder="Enter probability"
          min="0"
          max="100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          type="select"
          label="Stage"
          value={formData.stage}
          onChange={(e) => handleChange('stage', e.target.value)}
          options={stageOptions}
          error={errors.stage}
        />
        
        <FormField
          type="select"
          label="Contact"
          value={formData.contactId}
          onChange={(e) => handleChange('contactId', e.target.value)}
          options={contactOptions}
          error={errors.contactId}
          placeholder="Select contact"
        />
      </div>

      <FormField
        label="Expected Close Date"
        type="date"
        value={formData.expectedCloseDate}
        onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
        error={errors.expectedCloseDate}
      />

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
          icon={deal ? 'Save' : 'Plus'}
        >
          {deal ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;