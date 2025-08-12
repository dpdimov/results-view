'use client';

import { useState, useEffect } from 'react';
import { AssessmentResult } from '@/lib/database';
import FilterPanel from '@/components/FilterPanel';
import ResultsTable from '@/components/ResultsTable';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import ScatterplotHeatmap from '@/components/ScatterplotHeatmap';
import AdminLogin from '@/components/AdminLogin';
import { checkClientAuth, setClientAuth, logout } from '@/lib/auth';

interface ResultsResponse {
  results: AssessmentResult[];
  count: number;
  filters: any;
}

export default function Home() {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication on component mount
    const authenticated = checkClientAuth();
    setIsAuthenticated(authenticated);
    setAuthChecked(true);
    
    if (authenticated) {
      fetchResults(filters);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResults(filters);
    }
  }, [filters, isAuthenticated]);

  const fetchResults = async (filterParams: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key]) {
          params.append(key, filterParams[key]);
        }
      });

      const response = await fetch(`/api/results?${params}`);
      const data: ResultsResponse = await response.json();
      
      setResults(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleLogin = () => {
    setClientAuth(true);
    setIsAuthenticated(true);
    fetchResults(filters);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setResults([]);
    setTotalCount(0);
  };

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assessment Results Viewer</h1>
              <p className="mt-2 text-gray-600">
                View and analyze style assessment results from your Neon database
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>

        <FilterPanel onFiltersChange={handleFiltersChange} />
        
        <AnalyticsPanel filters={filters} />
        
        <ScatterplotHeatmap results={results} />
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Results ({totalCount} total)
            </h2>
            {!loading && results.length > 0 && (
              <p className="text-sm text-gray-600">
                Showing {results.length} of {totalCount} results
              </p>
            )}
          </div>
        </div>
        
        <ResultsTable results={results} loading={loading} />
        
        {!loading && results.length > 0 && results.length < totalCount && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing first {results.length} results. Use filters to narrow down or increase the limit to see more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}