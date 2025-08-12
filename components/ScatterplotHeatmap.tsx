'use client';

import { useEffect, useState } from 'react';
import { AssessmentResult } from '@/lib/database';
import dynamic from 'next/dynamic';

// Dynamically import Chart component to avoid SSR issues
const Chart = dynamic(() => import('./Chart'), { 
  ssr: false,
  loading: () => <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

interface ScatterplotHeatmapProps {
  results: AssessmentResult[];
  backgroundImage?: string;
}

interface DataPoint {
  x: number;
  y: number;
  count: number;
}

export default function ScatterplotHeatmap({ results, backgroundImage = '/images/plot-background.png' }: ScatterplotHeatmapProps) {
  const [gridData, setGridData] = useState<DataPoint[]>([]);

  useEffect(() => {
    if (results.length > 0) {
      // Simple grid processing
      const gridSize = 0.1;
      const grid: { [key: string]: DataPoint } = {};

      results.forEach(result => {
        const x = parseFloat(result.x_coordinate.toString());
        const y = parseFloat(result.y_coordinate.toString());
        
        const gridX = Math.round(x / gridSize) * gridSize;
        const gridY = Math.round(y / gridSize) * gridSize;
        const key = `${gridX.toFixed(3)},${gridY.toFixed(3)}`;

        if (grid[key]) {
          grid[key].count += 1;
        } else {
          grid[key] = { x: gridX, y: gridY, count: 1 };
        }
      });

      setGridData(Object.values(grid));
    }
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">No data available for heatmap</p>
          <p className="text-sm mt-2">Results will appear here when data is loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Results Heatmap</h2>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <Chart results={results} />
        </div>
      </div>
    </div>
  );
}