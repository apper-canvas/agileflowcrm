import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import emailService from '@/services/api/emailService';
import contactService from '@/services/api/contactService';

const EmailComposer = ({ isOpen, onClose, replyTo = null, threadId = null }) => {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (replyTo) {
      setFormData({
        to: replyTo.from,
        cc: '',
        bcc: '',
        subject: replyTo.subject.startsWith('RE:') ? replyTo.subject : `RE: ${replyTo.subject}`,
        body: `\n\n--- Original Message ---\nFrom: ${replyTo.from}\nSent: ${new Date(replyTo.createdAt).toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.body}`,
        priority: 'normal'
      });
    } else {
      setFormData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        priority: 'normal'
      });
    }
    setAttachments([]);
  }, [replyTo, isOpen]);

  const handleInputChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'to' && value.length > 2) {
      try {
        const contacts = await contactService.search(value);
        setContactSuggestions(contacts.slice(0, 5));
        setShowSuggestions(contacts.length > 0);
      } catch (error) {
        setContactSuggestions([]);
        setShowSuggestions(false);
      }
    } else if (field === 'to') {
      setShowSuggestions(false);
    }
  };

  const selectContact = (contact) => {
    setFormData(prev => ({ ...prev, to: contact.email }));
    setShowSuggestions(false);
    setContactSuggestions([]);
  };

  const handleFileAttach = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: `${Math.round(file.size / 1024)}KB`,
      type: file.type,
      file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!formData.to.trim()) {
      toast.error('Please enter a recipient');
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!formData.body.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const emailData = {
        ...formData,
        to: [formData.to.trim()],
        cc: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
        bcc: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
        from: 'john.doe@flowcrm.com',
        threadId: threadId || undefined,
        attachments: attachments.map(({ file, ...attachment }) => attachment)
      };

      await emailService.create(emailData);
      toast.success('Email sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Send email error:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={replyTo ? 'Reply to Email' : 'Compose Email'}
      size="lg"
      className="max-h-[90vh]"
    >
      <div className="space-y-4">
        <div className="relative">
          <FormField
            label="To"
            value={formData.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
            placeholder="Enter recipient email"
          />
          {showSuggestions && contactSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
              {contactSuggestions.map((contact) => (
                <button
                  key={contact.Id}
                  onClick={() => selectContact(contact)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{contact.name}</div>
                    <div className="text-xs text-gray-500">{contact.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="CC"
            value={formData.cc}
            onChange={(e) => handleInputChange('cc', e.target.value)}
            placeholder="Carbon copy recipients"
          />
          <FormField
            label="BCC"
            value={formData.bcc}
            onChange={(e) => handleInputChange('bcc', e.target.value)}
            placeholder="Blind carbon copy recipients"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Email subject"
          />
          <FormField
            type="select"
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            options={priorityOptions}
          />
        </div>

        <FormField
          type="textarea"
          label="Message"
          value={formData.body}
          onChange={(e) => handleInputChange('body', e.target.value)}
          placeholder="Type your message here..."
          rows={8}
        />

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <ApperIcon name="Paperclip" size={14} />
              Attach Files
              <input
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
              />
            </label>
          </div>
          
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="File" size={16} className="text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{attachment.name}</div>
                      <div className="text-xs text-gray-500">{attachment.size}</div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="X"
                    onClick={() => removeAttachment(index)}
                    className="border-0 hover:bg-gray-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            loading={loading}
            icon="Send"
          >
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailComposer;