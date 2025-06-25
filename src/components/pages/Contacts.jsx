import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import contactService from "@/services/api/contactService";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import EmptyState from "@/components/molecules/EmptyState";
import Modal from "@/components/molecules/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import ErrorState from "@/components/molecules/ErrorState";
import ContactForm from "@/components/organisms/ContactForm";
import ContactTable from "@/components/organisms/ContactTable";
import Button from "@/components/atoms/Button";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const statusOptions = [
    { value: 'all', label: 'All Contacts' },
    { value: 'active', label: 'Active' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'lead', label: 'Lead' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery, statusFilter]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

const filterContacts = () => {
    let filtered = [...contacts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        contact?.name?.toLowerCase().includes(query) ||
        contact?.email?.toLowerCase().includes(query) ||
        contact?.company?.toLowerCase().includes(query) ||
        contact?.phone?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact?.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleCreateContact = async (contactData) => {
    try {
      const newContact = await contactService.create(contactData);
      setContacts(prev => [...prev, newContact]);
      setShowCreateModal(false);
      toast.success('Contact created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create contact');
    }
  };

const handleEditContact = async (contactData) => {
    if (!selectedContact?.Id) {
      toast.error('No contact selected for update');
      return;
    }
    
    try {
      const updatedContact = await contactService.update(selectedContact.Id, contactData);
      setContacts(prev => prev.map(c => c?.Id === updatedContact?.Id ? updatedContact : c));
      setShowEditModal(false);
      setSelectedContact(null);
      toast.success('Contact updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update contact');
    }
  };

const handleDeleteContact = async (contact) => {
    if (!contact?.Id || !contact?.name) {
      toast.error('Invalid contact data');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        await contactService.delete(contact.Id);
        setContacts(prev => prev.filter(c => c?.Id !== contact.Id));
        toast.success('Contact deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete contact');
      }
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonLoader count={1} />
          <SkeletonLoader count={1} />
        </div>
        <SkeletonLoader count={5} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={loadContacts}
      />
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <Button
          icon="Plus"
          onClick={() => setShowCreateModal(true)}
        >
          Add Contact
        </Button>
      </div>

{/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search contacts..."
              onSearch={setSearchQuery}
              onAdvancedFilter={() => setShowFilterBuilder(!showFilterBuilder)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(option => (
              <Button
                key={option.value}
                size="sm"
                variant={statusFilter === option.value ? 'primary' : 'outline'}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

<AnimatePresence>
          {showFilterBuilder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 p-4 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Advanced Filters</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFilterBuilder(false)}
                >
                  Close
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Advanced filtering functionality will be available in a future update.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {filteredContacts.length === 0 ? (
        <EmptyState
          icon="Users"
          title={searchQuery || statusFilter !== 'all' ? 'No contacts found' : 'No contacts yet'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact'
          }
          actionLabel={searchQuery || statusFilter !== 'all' ? undefined : 'Add Contact'}
          onAction={searchQuery || statusFilter !== 'all' ? undefined : () => setShowCreateModal(true)}
        />
      ) : (
        <ContactTable
          contacts={filteredContacts}
          onEdit={(contact) => {
            setSelectedContact(contact);
            setShowEditModal(true);
          }}
          onDelete={handleDeleteContact}
          onView={handleViewContact}
        />
      )}

      {/* Create Contact Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Contact"
        size="lg"
      >
        <ContactForm
          onSubmit={handleCreateContact}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContact(null);
        }}
        title="Edit Contact"
        size="lg"
      >
        <ContactForm
          contact={selectedContact}
          onSubmit={handleEditContact}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedContact(null);
          }}
        />
      </Modal>
    </motion.div>
  );
};

export default Contacts;