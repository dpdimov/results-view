'use client';

import { useEffect, useState } from 'react';
import { AssessmentResult } from '@/lib/database';

// Dynamic import to avoid SSR issues
import dynamic from 'next/dynamic';
const Scatter = dynamic(() => import('react-chartjs-2').then((mod) => ({ default: mod.Scatter })), { ssr: false });

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

// Register Chart.js components (excluding Legend to fully disable it)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip
);

interface ChartProps {
  results: AssessmentResult[];
}

interface DataPoint {
  x: number;
  y: number;
  count: number;
}

export default function Chart({ results }: ChartProps) {
  const [processedData, setProcessedData] = useState<DataPoint[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    // Load background image
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);
    };
    img.onerror = () => {
      console.warn('Background image not found, using default background');
    };
    img.src = '/images/plot-background.png';
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      processHeatmapData();
    }
  }, [results]);

  const processHeatmapData = () => {
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

    setProcessedData(Object.values(grid));
  };

  const getPointColor = (count: number) => {
    const maxCount = Math.max(...processedData.map(d => d.count));
    const intensity = count / maxCount;
    
    // Grey to dark blue (#002c5f) scale
    const greyR = 128;
    const greyG = 128;
    const greyB = 128;
    
    const blueR = 0;   // #002c5f red component
    const blueG = 44;  // #002c5f green component  
    const blueB = 95;  // #002c5f blue component
    
    // Interpolate between grey and blue
    const r = Math.floor(greyR * (1 - intensity) + blueR * intensity);
    const g = Math.floor(greyG * (1 - intensity) + blueG * intensity);
    const b = Math.floor(greyB * (1 - intensity) + blueB * intensity);
    
    const alpha = Math.min(0.6 + intensity * 0.4, 1);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getPointSize = (count: number) => {
    const maxCount = Math.max(...processedData.map(d => d.count));
    const minSize = 3;
    const maxSize = 15;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  const chartData = {
    datasets: [
      {
        label: '', // Remove label to prevent legend
        data: processedData.map(point => ({
          x: point.x,
          y: point.y,
        })),
        backgroundColor: processedData.map(point => getPointColor(point.count)),
        borderColor: processedData.map(point => getPointColor(point.count).replace(/[\d.]+\)$/g, '1)')),
        borderWidth: 1,
        pointRadius: processedData.map(point => getPointSize(point.count)),
        pointHoverRadius: processedData.map(point => getPointSize(point.count) + 2),
        showLine: false, // Ensure no lines are drawn
      },
    ],
  };

  // Background image plugin
  const backgroundImagePlugin = {
    id: 'backgroundImage',
    beforeDraw: (chart: any) => {
      if (backgroundImage) {
        const ctx = chart.canvas.getContext('2d');
        const chartArea = chart.chartArea;
        
        ctx.save();
        ctx.globalAlpha = 1.0;
        
        ctx.drawImage(
          backgroundImage,
          chartArea.left,
          chartArea.top,
          chartArea.right - chartArea.left,
          chartArea.bottom - chartArea.top
        );
        
        ctx.restore();
      }
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: () => '',
          label: (context: any) => {
            const point = context.parsed;
            const dataPoint = processedData[context.dataIndex];
            return [
              `Position: (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`,
              `Count: ${dataPoint.count} assessment${dataPoint.count > 1 ? 's' : ''}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: -1,
        max: 1,
        display: false, // Hide entire x-axis
      },
      y: {
        type: 'linear' as const,
        min: -1,
        max: 1,
        display: false, // Hide entire y-axis
      }
    },
    plugins: [backgroundImagePlugin]
  };

  if (processedData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Processing data...</p>
      </div>
    );
  }

  return <Scatter data={chartData} options={options} plugins={[backgroundImagePlugin]} />;
}