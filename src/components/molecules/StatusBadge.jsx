import Badge from '@/components/atoms/Badge';

const StatusBadge = ({ status, type = 'contact' }) => {
  const statusConfigs = {
    contact: {
      active: { variant: 'success', label: 'Active' },
      prospect: { variant: 'info', label: 'Prospect' },
      lead: { variant: 'warning', label: 'Lead' },
      inactive: { variant: 'default', label: 'Inactive' }
    },
    deal: {
      lead: { variant: 'default', label: 'Lead' },
      qualified: { variant: 'info', label: 'Qualified' },
      proposal: { variant: 'warning', label: 'Proposal' },
      negotiation: { variant: 'primary', label: 'Negotiation' },
      'closed-won': { variant: 'success', label: 'Closed Won' },
      'closed-lost': { variant: 'error', label: 'Closed Lost' }
    },
    task: {
      pending: { variant: 'warning', label: 'Pending' },
      'in-progress': { variant: 'info', label: 'In Progress' },
      completed: { variant: 'success', label: 'Completed' },
      overdue: { variant: 'error', label: 'Overdue' }
    },
    priority: {
      low: { variant: 'default', label: 'Low' },
      medium: { variant: 'warning', label: 'Medium' },
      high: { variant: 'error', label: 'High' }
    }
  };

  const config = statusConfigs[type]?.[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;