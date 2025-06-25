import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Modal from '@/components/molecules/Modal';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import DealPipeline from '@/components/organisms/DealPipeline';
import DealForm from '@/components/organisms/DealForm';
import dealService from '@/services/api/dealService';
import contactService from '@/services/api/contactService';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError(err.message || 'Failed to load deals');
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (dealData) => {
    try {
      const newDeal = await dealService.create(dealData);
      setDeals(prev => [...prev, newDeal]);
      setShowCreateModal(false);
      toast.success('Deal created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create deal');
    }
  };

  const handleEditDeal = async (dealData) => {
    try {
      const updatedDeal = await dealService.update(selectedDeal.Id, dealData);
      setDeals(prev => prev.map(d => d.Id === updatedDeal.Id ? updatedDeal : d));
      setShowEditModal(false);
      setSelectedDeal(null);
      toast.success('Deal updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update deal');
    }
  };

  const handleUpdateStage = async (dealId, newStage) => {
    try {
      const updatedDeal = await dealService.updateStage(dealId, newStage);
      setDeals(prev => prev.map(d => d.Id === dealId ? updatedDeal : d));
    } catch (error) {
      toast.error('Failed to update deal stage');
      throw error;
    }
  };

  const handleDeleteDeal = async (deal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        await dealService.delete(deal.Id);
        setDeals(prev => prev.filter(d => d.Id !== deal.Id));
        toast.success('Deal deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete deal');
      }
    }
  };

  const calculatePipelineMetrics = () => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const activeDeals = deals.filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage));
    const wonDeals = deals.filter(deal => deal.stage === 'closed-won');
    const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length * 100).toFixed(1) : 0;

    return { totalValue, activeDeals: activeDeals.length, conversionRate };
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonLoader count={3} type="card" />
        </div>
        <SkeletonLoader count={1} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={loadData}
      />
    );
  }

  const metrics = calculatePipelineMetrics();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600">Track and manage your deals</p>
        </div>
        <Button
          icon="Plus"
          onClick={() => setShowCreateModal(true)}
        >
          Add Deal
        </Button>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalValue)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeDeals}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {deals.length === 0 ? (
        <EmptyState
          icon="Target"
          title="No deals yet"
          description="Start tracking your sales opportunities by creating your first deal"
          actionLabel="Create Deal"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <DealPipeline
            deals={deals}
            contacts={contacts}
            onUpdateStage={handleUpdateStage}
            onEdit={(deal) => {
              setSelectedDeal(deal);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteDeal}
          />
        </div>
      )}

      {/* Create Deal Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Deal"
        size="lg"
      >
        <DealForm
          onSubmit={handleCreateDeal}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDeal(null);
        }}
        title="Edit Deal"
        size="lg"
      >
        <DealForm
          deal={selectedDeal}
          onSubmit={handleEditDeal}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedDeal(null);
          }}
        />
      </Modal>
    </motion.div>
  );
};

export default Deals;