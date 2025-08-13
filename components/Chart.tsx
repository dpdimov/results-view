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
      processScatterData();
    }
  }, [results]);

  const processScatterData = () => {
    // Convert all results to simple points with coordinate clamping to match density map margins
    const scatterPoints: DataPoint[] = results.map(result => {
      const rawX = parseFloat(result.x_coordinate.toString());
      const rawY = parseFloat(result.y_coordinate.toString());
      
      // Apply 10/12 ratio clamping to match background image plot area
      const maxRange = 10/12; // ≈ 0.833
      const clampedX = Math.max(-maxRange, Math.min(maxRange, rawX));
      const clampedY = Math.max(-maxRange, Math.min(maxRange, rawY));
      
      return {
        x: clampedX,
        y: clampedY,
        count: 1 // Each individual point
      };
    });

    setProcessedData(scatterPoints);
  };

  const getPointColor = () => {
    return '#333333'; // Consistent grey color
  };

  const getPointSize = () => {
    return 4; // Consistent size for all points
  };

  const chartData = {
    datasets: [
      {
        label: '', // Remove label to prevent legend
        data: processedData.map(point => ({
          x: point.x,
          y: point.y,
        })),
        backgroundColor: getPointColor(),
        borderColor: getPointColor(),
        borderWidth: 1,
        pointRadius: getPointSize(),
        pointHoverRadius: getPointSize() + 2,
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
        
        // Draw background image to fill entire chart area
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
            return `Position: (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`;
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
    }
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