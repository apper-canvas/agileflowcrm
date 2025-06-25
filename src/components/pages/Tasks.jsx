import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Modal from '@/components/molecules/Modal';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import TaskList from '@/components/organisms/TaskList';
import TaskForm from '@/components/organisms/TaskForm';
import taskService from '@/services/api/taskService';
import contactService from '@/services/api/contactService';
import dealService from '@/services/api/dealService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [tasksData, contactsData, dealsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setTasks(tasksData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [...prev, newTask]);
      setShowCreateModal(false);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const updatedTask = await taskService.update(selectedTask.Id, taskData);
      setTasks(prev => prev.map(t => t.Id === updatedTask.Id ? updatedTask : t));
      setShowEditModal(false);
      setSelectedTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setTasks(prev => prev.map(t => t.Id === taskId ? updatedTask : t));
      const task = tasks.find(t => t.Id === taskId);
      if (task) {
        toast.success(`Task ${updatedTask.status === 'completed' ? 'completed' : 'reopened'}`);
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await taskService.delete(task.Id);
        setTasks(prev => prev.filter(t => t.Id !== task.Id));
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete task');
      }
    }
  };

  const calculateTaskMetrics = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { totalTasks, pendingTasks, completedTasks, overdueTasks };
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonLoader count={4} type="card" />
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

  const metrics = calculateTaskMetrics();

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
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your to-do list and stay organized</p>
        </div>
        <Button
          icon="Plus"
          onClick={() => setShowCreateModal(true)}
        >
          Add Task
        </Button>
      </div>

      {/* Task Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalTasks}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingTasks}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.completedTasks}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.overdueTasks}</p>
            </div>
            <div className="p-3 bg-error/10 rounded-lg">
              <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon="CheckSquare"
          title="No tasks yet"
          description="Stay organized by creating your first task"
          actionLabel="Create Task"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <TaskList
          tasks={tasks}
          contacts={contacts}
          deals={deals}
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => {
            setSelectedTask(task);
            setShowEditModal(true);
          }}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          onSubmit={handleEditTask}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
        />
      </Modal>
    </motion.div>
  );
};

export default Tasks;