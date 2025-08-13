'use client';

import { useState } from 'react';
import { AssessmentResult } from '@/lib/database';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const DensityMap = dynamic(() => import('./DensityMap'), { 
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-center py-8">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading visualization...</span>
        </div>
      </div>
    </div>
  )
});

const Chart = dynamic(() => import('./Chart'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
});

interface ScatterplotHeatmapProps {
  results: AssessmentResult[];
  backgroundImage?: string;
  assessmentId?: string;
}

export default function ScatterplotHeatmap({ results, backgroundImage = '/images/plot-background.png', assessmentId = 'kinetic-thinking' }: ScatterplotHeatmapProps) {
  const [viewMode, setViewMode] = useState<'density' | 'scatter'>('density');

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">No data available for visualization</p>
          <p className="text-sm mt-2">Results will appear here when data is loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Results Visualization</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('density')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              viewMode === 'density'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Density Map
          </button>
          <button
            onClick={() => setViewMode('scatter')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              viewMode === 'scatter'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Scatter Plot
          </button>
        </div>
      </div>
      
      {viewMode === 'density' ? (
        <div className="flex justify-center">
          <DensityMap results={results} backgroundImage={backgroundImage} width={400} height={400} assessmentId={assessmentId} />
        </div>
      ) : (
        <div className="flex justify-center">
          <div style={{ width: 400, height: 400 }}>
            <Chart results={results} backgroundImage={backgroundImage} />
          </div>
        </div>
      )}
    </div>
  );
}