'use client';

import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Search, Filter, X } from 'lucide-react';

interface AlertFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onTypeFilterChange: (type: string) => void;
  className?: string;
}

export default function AlertFilters({ 
  onSearchChange, 
  onStatusFilterChange, 
  onTypeFilterChange,
  className = '' 
}: AlertFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    onStatusFilterChange(status);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    onTypeFilterChange(type);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    onSearchChange('');
    onStatusFilterChange('all');
    onTypeFilterChange('all');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <Card className={`border-2 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textSecondary" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-secondary rounded-md bg-background text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filters</span>
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-textSecondary hover:text-textPrimary"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-secondary space-y-3">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-textSecondary mb-1 block">
                Status
              </label>
              <div className="flex space-x-2">
                {['all', 'countdown', 'overdue', 'closed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilterChange(status)}
                    className="text-xs capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs font-medium text-textSecondary mb-1 block">
                Type
              </label>
              <div className="flex space-x-2">
                {['all', 'Fire', 'Smoke', 'Heat', 'Carbon Monoxide'].map((type) => (
                  <Button
                    key={type}
                    variant={typeFilter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTypeFilterChange(type)}
                    className="text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 