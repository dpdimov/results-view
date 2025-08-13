'use client';

import { useState, useEffect } from 'react';

interface FilterOptions {
  customCodes: string[];
  emailDomains: string[];
}

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void;
}

export default function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    customCodes: [],
    emailDomains: []
  });
  
  const [filters, setFilters] = useState({
    customCode: '',
    emailDomain: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // Apply initial filter when component mounts
    onFiltersChange(filters);
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/filters');
      const data = await response.json();
      console.log('Admin filter options received:', data); // Debug log
      setFilterOptions(data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      customCode: '',
      emailDomain: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchFilterOptions}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh Filters
          </button>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Code
          </label>
          <select
            value={filters.customCode}
            onChange={(e) => handleFilterChange('customCode', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Custom Codes</option>
            {filterOptions.customCodes.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Domain
          </label>
          <select
            value={filters.emailDomain}
            onChange={(e) => handleFilterChange('emailDomain', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Domains</option>
            {filterOptions.emailDomains.map((domain) => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

      </div>
    </div>
  );
}