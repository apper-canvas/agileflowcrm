import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import ActivityTimeline from '@/components/organisms/ActivityTimeline';
import activityService from '@/services/api/activityService';
import contactService from '@/services/api/contactService';
import dealService from '@/services/api/dealService';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'email', label: 'Emails' },
    { value: 'call', label: 'Calls' },
    { value: 'meeting', label: 'Meetings' },
    { value: 'note', label: 'Notes' },
    { value: 'task', label: 'Tasks' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const getActivityMetrics = () => {
    const totalActivities = activities.length;
    const todayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    }).length;

    const activityByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return { totalActivities, todayActivities, activityByType };
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
        <SkeletonLoader count={5} type="card" />
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

  const metrics = getActivityMetrics();

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
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">Track all your customer interactions</p>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalActivities}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Activities</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.todayActivities}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Most Active Type</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {Object.keys(metrics.activityByType).length > 0
                  ? Object.entries(metrics.activityByType).sort(([,a], [,b]) => b - a)[0][0]
                  : 'None'
                }
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

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

      {/* Activities Timeline */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon="Activity"
          title={filter === 'all' ? 'No activities yet' : `No ${filter} activities`}
          description={
            filter === 'all'
              ? 'Activities will appear here as you interact with contacts and deals'
              : `No ${filter} activities found. Try selecting a different filter.`
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
          <ActivityTimeline
            activities={filteredActivities}
            contacts={contacts}
            deals={deals}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Activities;