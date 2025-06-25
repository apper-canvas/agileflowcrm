import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import MetricCard from '@/components/organisms/MetricCard';
import Card from '@/components/molecules/Card';
import Button from '@/components/atoms/Button';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import ActivityTimeline from '@/components/organisms/ActivityTimeline';
import contactService from '@/services/api/contactService';
import dealService from '@/services/api/dealService';
import taskService from '@/services/api/taskService';
import activityService from '@/services/api/activityService';

const Dashboard = () => {
  const [data, setData] = useState({
    contacts: [],
    deals: [],
    tasks: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [contacts, deals, tasks, activities] = await Promise.all([
          contactService.getAll(),
          dealService.getAll(),
          taskService.getAll(),
          activityService.getAll()
        ]);

        setData({ contacts, deals, tasks, activities });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={2} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Calculate metrics
  const totalContacts = data.contacts.length;
  const activeDeals = data.deals.filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage)).length;
  const totalPipelineValue = data.deals
    .filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.value, 0);
  const pendingTasks = data.tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = data.tasks.filter(task => {
    if (task.status === 'completed') return false;
    return new Date(task.dueDate) < startOfDay(new Date());
  }).length;

  // Recent activities (last 5)
  const recentActivities = data.activities.slice(0, 5);

  // Upcoming tasks (next 7 days)
  const upcomingTasks = data.tasks
    .filter(task => {
      if (task.status === 'completed') return false;
      const taskDate = new Date(task.dueDate);
      const today = startOfDay(new Date());
      const nextWeek = endOfDay(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      return taskDate >= today && taskDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Pipeline by stage
  const pipelineByStage = data.deals.reduce((acc, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = { count: 0, value: 0 };
    }
    acc[deal.stage].count += 1;
    acc[deal.stage].value += deal.value;
    return acc;
  }, {});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your sales.</p>
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      {/* Metrics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItemVariants}>
          <MetricCard
            title="Total Contacts"
            value={totalContacts}
            icon="Users"
            color="primary"
          />
        </motion.div>
        
        <motion.div variants={staggerItemVariants}>
          <MetricCard
            title="Active Deals"
            value={activeDeals}
            icon="Target"
            color="success"
          />
        </motion.div>
        
        <motion.div variants={staggerItemVariants}>
          <MetricCard
            title="Pipeline Value"
            value={formatCurrency(totalPipelineValue)}
            icon="DollarSign"
            color="warning"
          />
        </motion.div>
        
        <motion.div variants={staggerItemVariants}>
          <MetricCard
            title="Pending Tasks"
            value={pendingTasks}
            change={overdueTasks > 0 ? `${overdueTasks} overdue` : undefined}
            changeType={overdueTasks > 0 ? 'negative' : 'neutral'}
            icon="CheckSquare"
            color="info"
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <motion.div
          variants={staggerItemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pipeline Overview</h3>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/deals'}>
                View All
              </Button>
            </div>
            
            {Object.keys(pipelineByStage).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(pipelineByStage).map(([stage, data]) => (
                  <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {stage.replace('-', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">{data.count} deals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(data.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="Target"
                title="No deals yet"
                description="Start by creating your first deal"
                actionLabel="Create Deal"
                onAction={() => window.location.href = '/deals'}
              />
            )}
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          variants={staggerItemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/tasks'}>
                View All
              </Button>
            </div>
            
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.Id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-error' :
                      task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-sm text-gray-600">
                        Due {format(new Date(task.dueDate), 'MMM dd')}
                      </p>
                    </div>
                    <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="CheckSquare"
                title="No upcoming tasks"
                description="You're all caught up!"
              />
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        variants={staggerItemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/activities'}>
              View All
            </Button>
          </div>
          
          {recentActivities.length > 0 ? (
            <ActivityTimeline 
              activities={recentActivities}
              contacts={data.contacts}
              deals={data.deals}
            />
          ) : (
            <EmptyState
              icon="Activity"
              title="No recent activities"
              description="Activities will appear here as you interact with contacts and deals"
            />
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;