import { useState } from 'react';
import { toast } from 'react-toastify';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import contactService from '@/services/api/contactService';

const ContactForm = ({ contact, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    status: contact?.status || 'lead',
    tags: contact?.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
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
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      let result;
      if (contact) {
        result = await contactService.update(contact.Id, submitData);
        toast.success('Contact updated successfully');
      } else {
        result = await contactService.create(submitData);
        toast.success('Contact created successfully');
      }

      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save contact');
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter full name"
        />
        
        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="Enter phone number"
        />
        
        <FormField
          label="Company"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          error={errors.company}
          placeholder="Enter company name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          type="select"
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
          error={errors.status}
        />
        
        <FormField
          label="Tags"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          error={errors.tags}
          placeholder="Enter tags separated by commas"
          helperText="Separate multiple tags with commas"
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
          icon={contact ? 'Save' : 'Plus'}
        >
          {contact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;