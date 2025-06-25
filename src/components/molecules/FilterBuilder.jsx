import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Card from '@/components/molecules/Card';
import ApperIcon from '@/components/ApperIcon';

const FilterBuilder = ({ 
  onFiltersChange, 
  dataType = 'contacts', 
  className = '',
  isOpen = false,
  onClose 
}) => {
  const [conditions, setConditions] = useState([]);
  const [logicalOperator, setLogicalOperator] = useState('AND');

  const fieldConfigs = {
    contacts: {
      name: { label: 'Name', type: 'text', placeholder: 'Enter name...' },
      email: { label: 'Email', type: 'text', placeholder: 'Enter email...' },
      company: { label: 'Company', type: 'text', placeholder: 'Enter company...' },
      phone: { label: 'Phone', type: 'text', placeholder: 'Enter phone...' },
      status: { 
        label: 'Status', 
        type: 'select', 
        options: [
          { value: 'active', label: 'Active' },
          { value: 'prospect', label: 'Prospect' },
          { value: 'lead', label: 'Lead' },
          { value: 'inactive', label: 'Inactive' }
        ]
      },
      tags: { label: 'Tags', type: 'tags', placeholder: 'Enter tags (comma separated)...' },
      createdAt: { label: 'Created Date', type: 'dateRange' },
      lastContactedAt: { label: 'Last Contact Date', type: 'dateRange' }
    },
    deals: {
      title: { label: 'Title', type: 'text', placeholder: 'Enter deal title...' },
      value: { label: 'Value', type: 'number', placeholder: 'Enter amount...' },
      stage: { 
        label: 'Stage', 
        type: 'select', 
        options: [
          { value: 'lead', label: 'Lead' },
          { value: 'qualified', label: 'Qualified' },
          { value: 'proposal', label: 'Proposal' },
          { value: 'negotiation', label: 'Negotiation' },
          { value: 'closed-won', label: 'Closed Won' },
          { value: 'closed-lost', label: 'Closed Lost' }
        ]
      },
      probability: { label: 'Probability (%)', type: 'number', placeholder: 'Enter probability...' },
      expectedCloseDate: { label: 'Expected Close Date', type: 'dateRange' },
      createdAt: { label: 'Created Date', type: 'dateRange' }
    }
  };

  const operatorOptions = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'startsWith', label: 'Starts with' },
      { value: 'endsWith', label: 'Ends with' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'lessThan', label: 'Less than' },
      { value: 'between', label: 'Between' }
    ],
    select: [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not equals' }
    ],
    tags: [
      { value: 'contains', label: 'Contains any' },
      { value: 'containsAll', label: 'Contains all' },
      { value: 'notContains', label: 'Does not contain' }
    ],
    dateRange: [
      { value: 'equals', label: 'On date' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'between', label: 'Between' }
    ]
  };

  const addCondition = () => {
    const fields = Object.keys(fieldConfigs[dataType]);
    const firstField = fields[0];
    const fieldConfig = fieldConfigs[dataType][firstField];
    
    const newCondition = {
      id: Date.now(),
      field: firstField,
      operator: operatorOptions[fieldConfig.type][0].value,
      value: fieldConfig.type === 'dateRange' ? { from: null, to: null } : '',
      type: fieldConfig.type
    };
    
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id, updates) => {
    setConditions(conditions.map(condition => 
      condition.id === id ? { ...condition, ...updates } : condition
    ));
  };

  const clearAllFilters = () => {
    setConditions([]);
    setLogicalOperator('AND');
    onFiltersChange([]);
    toast.success('All filters cleared');
  };

  const applyFilters = () => {
    if (conditions.length === 0) {
      onFiltersChange([]);
      return;
    }

    // Validate conditions
    const invalidConditions = conditions.filter(condition => {
      if (condition.type === 'dateRange') {
        return !condition.value.from && !condition.value.to;
      }
      return !condition.value || condition.value.toString().trim() === '';
    });

    if (invalidConditions.length > 0) {
      toast.error('Please fill in all filter conditions');
      return;
    }

    onFiltersChange({ conditions, logicalOperator });
    toast.success(`${conditions.length} filter${conditions.length !== 1 ? 's' : ''} applied`);
  };

  const handleFieldChange = (id, newField) => {
    const fieldConfig = fieldConfigs[dataType][newField];
    const defaultOperator = operatorOptions[fieldConfig.type][0].value;
    const defaultValue = fieldConfig.type === 'dateRange' ? { from: null, to: null } : '';
    
    updateCondition(id, {
      field: newField,
      operator: defaultOperator,
      value: defaultValue,
      type: fieldConfig.type
    });
  };

  const renderValueInput = (condition) => {
    const fieldConfig = fieldConfigs[dataType][condition.field];
    
    switch (condition.type) {
      case 'text':
        return (
          <Input
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder={fieldConfig.placeholder}
            className="flex-1"
          />
        );
      
      case 'number':
        if (condition.operator === 'between') {
          return (
            <div className="flex gap-2 flex-1">
              <Input
                type="number"
                value={condition.value.from || ''}
                onChange={(e) => updateCondition(condition.id, { 
                  value: { ...condition.value, from: e.target.value }
                })}
                placeholder="From"
                className="flex-1"
              />
              <Input
                type="number"
                value={condition.value.to || ''}
                onChange={(e) => updateCondition(condition.id, { 
                  value: { ...condition.value, to: e.target.value }
                })}
                placeholder="To"
                className="flex-1"
              />
            </div>
          );
        }
        return (
          <Input
            type="number"
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder={fieldConfig.placeholder}
            className="flex-1"
          />
        );
      
      case 'select':
        return (
          <Select
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            className="flex-1"
          >
            <option value="">Select {fieldConfig.label}</option>
            {fieldConfig.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'tags':
        return (
          <Input
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder={fieldConfig.placeholder}
            className="flex-1"
          />
        );
      
      case 'dateRange':
        if (condition.operator === 'between') {
          return (
            <div className="flex gap-2 flex-1">
              <DatePicker
                selected={condition.value.from}
                onChange={(date) => updateCondition(condition.id, { 
                  value: { ...condition.value, from: date }
                })}
                placeholderText="From date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                dateFormat="MMM dd, yyyy"
              />
              <DatePicker
                selected={condition.value.to}
                onChange={(date) => updateCondition(condition.id, { 
                  value: { ...condition.value, to: date }
                })}
                placeholderText="To date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                dateFormat="MMM dd, yyyy"
              />
            </div>
          );
        }
        return (
          <DatePicker
            selected={condition.value.from || condition.value}
            onChange={(date) => updateCondition(condition.id, { 
              value: condition.operator === 'between' ? { ...condition.value, from: date } : date
            })}
            placeholderText="Select date"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            dateFormat="MMM dd, yyyy"
          />
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${className}`}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
          <Button
            size="sm"
            variant="outline"
            icon="X"
            onClick={onClose}
            className="border-0 hover:bg-gray-100"
          />
        </div>

        <div className="space-y-4">
          {conditions.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Combine conditions with:</span>
              <Select
                value={logicalOperator}
                onChange={(e) => setLogicalOperator(e.target.value)}
                className="w-20"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </Select>
            </div>
          )}

          <AnimatePresence>
            {conditions.map((condition, index) => (
              <motion.div
                key={condition.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                {index > 0 && (
                  <span className="text-sm font-medium text-gray-500 px-2">
                    {logicalOperator}
                  </span>
                )}
                
                <Select
                  value={condition.field}
                  onChange={(e) => handleFieldChange(condition.id, e.target.value)}
                  className="w-40"
                >
                  {Object.entries(fieldConfigs[dataType]).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </Select>

                <Select
                  value={condition.operator}
                  onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                  className="w-32"
                >
                  {operatorOptions[condition.type].map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Select>

                {renderValueInput(condition)}

                <Button
                  size="sm"
                  variant="outline"
                  icon="Trash2"
                  onClick={() => removeCondition(condition.id)}
                  className="border-0 hover:bg-red-50 hover:text-error"
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              icon="Plus"
              onClick={addCondition}
            >
              Add Condition
            </Button>

            <div className="flex gap-2">
              {conditions.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              )}
              <Button
                size="sm"
                onClick={applyFilters}
                disabled={conditions.length === 0}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FilterBuilder;