import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/molecules/Card';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  color = 'primary',
  className = '' 
}) => {
  const colors = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    info: 'bg-info text-white'
  };

  const changeColors = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-gray-500'
  };

  const changeIcons = {
    positive: 'TrendingUp',
    negative: 'TrendingDown',
    neutral: 'Minus'
  };

  return (
    <Card className={`p-6 ${className}`} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className={`flex items-center text-sm ${changeColors[changeType]}`}>
              <ApperIcon name={changeIcons[changeType]} size={16} className="mr-1" />
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <ApperIcon name={icon} size={24} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;