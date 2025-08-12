'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  total_assessments: number;
  avg_x: number;
  avg_y: number;
  first_assessment: string;
  last_assessment: string;
  unique_custom_codes: number;
  unique_domains: number;
}

interface AnalyticsPanelProps {
  filters: any;
}

export default function AnalyticsPanel({ filters }: AnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'limit' && key !== 'offset') {
          params.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Analytics Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Assessments</h3>
          <p className="text-2xl font-bold text-blue-600">{analytics.total_assessments}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Avg X Coordinate</h3>
          <p className="text-2xl font-bold text-green-600">
            {analytics.avg_x ? parseFloat(analytics.avg_x.toString()).toFixed(3) : '0.000'}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Avg Y Coordinate</h3>
          <p className="text-2xl font-bold text-purple-600">
            {analytics.avg_y ? parseFloat(analytics.avg_y.toString()).toFixed(3) : '0.000'}
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800">Unique Codes</h3>
          <p className="text-2xl font-bold text-orange-600">{analytics.unique_custom_codes}</p>
        </div>
      </div>
      
      {analytics.first_assessment && analytics.last_assessment && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">First Assessment</h4>
              <p className="text-sm text-gray-600">
                {new Date(analytics.first_assessment).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Last Assessment</h4>
              <p className="text-sm text-gray-600">
                {new Date(analytics.last_assessment).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}