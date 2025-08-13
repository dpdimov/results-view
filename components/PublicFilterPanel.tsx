'use client';

import { useState, useEffect } from 'react';

interface FilterOptions {
  assessmentIds: string[];
}

interface PublicFilterPanelProps {
  onFiltersChange: (filters: any) => void;
}

export default function PublicFilterPanel({ onFiltersChange }: PublicFilterPanelProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    assessmentIds: []
  });
  
  const [filters, setFilters] = useState({
    assessmentId: 'kinetic-thinking'
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
      setFilterOptions({ assessmentIds: data.assessmentIds });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (value: string) => {
    const newFilters = { assessmentId: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Assessment Type</h2>
      </div>
      
      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Assessment
        </label>
        <select
          value={filters.assessmentId}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {filterOptions.assessmentIds.map((id) => (
            <option key={id} value={id}>
              {id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}