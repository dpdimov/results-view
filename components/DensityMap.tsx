'use client';

import { useEffect, useRef, useState } from 'react';
import { AssessmentResult } from '@/lib/database';
import { getAssessmentConfig } from '@/lib/config';

interface DensityMapProps {
  results: AssessmentResult[];
  width?: number;
  height?: number;
  backgroundImage?: string;
  assessmentId?: string;
}

interface Point {
  x: number;
  y: number;
}

export default function DensityMap({ 
  results, 
  width = 500, 
  height = 500, 
  backgroundImage = '/images/plot-background.png',
  assessmentId = 'kinetic-thinking'
}: DensityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  // Load assessment configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const assessmentConfig = await getAssessmentConfig(assessmentId);
        setConfig(assessmentConfig);
      } catch (error) {
        console.error('Error loading assessment config:', error);
        setConfig(null);
      }
    };
    loadConfig();
  }, [assessmentId]);

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setBackgroundImg(img);
    };
    img.onerror = () => {
      console.warn('Background image not found:', backgroundImage);
      setBackgroundImg(null);
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  useEffect(() => {
    if (results.length > 0) {
      drawDensityMap();
    }
  }, [results, backgroundImg, width, height]);

  const normalizeCoordinates = (x: number, y: number): Point => {
    // Convert from [-1, 1] range to canvas coordinates
    const canvasX = ((x + 1) / 2) * width;
    const canvasY = ((1 - y) / 2) * height; // Flip Y axis
    return { x: canvasX, y: canvasY };
  };

  const gaussianKernel = (distance: number, bandwidth: number): number => {
    return Math.exp(-(distance * distance) / (2 * bandwidth * bandwidth));
  };

  const drawDensityMap = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background image if available
    if (backgroundImg) {
      ctx.save();
      ctx.globalAlpha = 0.7; // Semi-transparent background
      ctx.drawImage(backgroundImg, 0, 0, width, height);
      ctx.restore();
    }

    // Convert data points to canvas coordinates
    const points: Point[] = results.map(result => {
      const x = parseFloat(result.x_coordinate.toString());
      const y = parseFloat(result.y_coordinate.toString());
      return normalizeCoordinates(x, y);
    });

    if (points.length === 0) {
      setIsLoading(false);
      return;
    }

    // Create density map with optimization
    const densityData = new Array(width * height).fill(0);
    const densityConfig = config?.visualization?.densityConfig || {};
    const bandwidth = Math.min(width, height) * (densityConfig.bandwidth || 0.03);
    const maxDistance = bandwidth * (densityConfig.maxDistanceMultiplier || 2);
    const maxDistanceSquared = maxDistance * maxDistance; // Avoid sqrt in inner loop

    // Calculate density for each pixel (optimized)
    for (let pixelY = 0; pixelY < height; pixelY++) {
      for (let pixelX = 0; pixelX < width; pixelX++) {
        let density = 0;

        for (const point of points) {
          const dx = pixelX - point.x;
          const dy = pixelY - point.y;
          const distanceSquared = dx * dx + dy * dy;
          
          // Skip points that are too far away (optimization)
          if (distanceSquared <= maxDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            density += gaussianKernel(distance, bandwidth);
          }
        }

        densityData[pixelY * width + pixelX] = density;
      }
      
      // Add a small yield to prevent blocking the UI
      if (pixelY % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Find max density for normalization (efficient for large arrays)
    let maxDensity = 0;
    for (let i = 0; i < densityData.length; i++) {
      if (densityData[i] > maxDensity) {
        maxDensity = densityData[i];
      }
    }
    
    if (maxDensity === 0) {
      setIsLoading(false);
      return;
    }

    // Get the current canvas image data (which includes the background)
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Blend density colors with existing background
    for (let i = 0; i < densityData.length; i++) {
      const normalizedDensity = densityData[i] / maxDensity;
      
      if (normalizedDensity > 0) {
        const color = getHeatmapColor(normalizedDensity);
        const pixelIndex = i * 4;
        
        // Get current background pixel
        const bgR = data[pixelIndex];
        const bgG = data[pixelIndex + 1];
        const bgB = data[pixelIndex + 2];
        const bgA = data[pixelIndex + 3];
        
        // Blend the density color with the background
        const alpha = color.a / 255;
        data[pixelIndex] = Math.floor(bgR * (1 - alpha) + color.r * alpha);     // Red
        data[pixelIndex + 1] = Math.floor(bgG * (1 - alpha) + color.g * alpha); // Green
        data[pixelIndex + 2] = Math.floor(bgB * (1 - alpha) + color.b * alpha); // Blue
        data[pixelIndex + 3] = Math.max(bgA, color.a); // Keep the higher alpha
      }
    }

    // Draw the blended result
    ctx.putImageData(imageData, 0, 0);

    // Draw the original points as small dots
    ctx.save();
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.restore();

    setIsLoading(false);
  };

  const getHeatmapColor = (intensity: number): { r: number; g: number; b: number; a: number } => {
    // Create a smooth color gradient from transparent blue through green, yellow, to red
    if (intensity === 0) {
      return { r: 0, g: 0, b: 0, a: 0 }; // Transparent for zero density
    }

    const alphaRange = config?.visualization?.densityConfig?.alphaRange || { min: 30, max: 150 };
    const alpha = Math.min(alphaRange.max, alphaRange.min + intensity * (alphaRange.max - alphaRange.min)); // Configurable transparency

    if (intensity < 0.25) {
      // Blue to Cyan
      const t = intensity * 4;
      return {
        r: 0,
        g: Math.floor(t * 255),
        b: 255,
        a: alpha
      };
    } else if (intensity < 0.5) {
      // Cyan to Green
      const t = (intensity - 0.25) * 4;
      return {
        r: 0,
        g: 255,
        b: Math.floor((1 - t) * 255),
        a: alpha
      };
    } else if (intensity < 0.75) {
      // Green to Yellow
      const t = (intensity - 0.5) * 4;
      return {
        r: Math.floor(t * 255),
        g: 255,
        b: 0,
        a: alpha
      };
    } else {
      // Yellow to Red
      const t = (intensity - 0.75) * 4;
      return {
        r: 255,
        g: Math.floor((1 - t) * 255),
        b: 0,
        a: alpha
      };
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg">No data available for density map</p>
        <p className="text-sm mt-2">Results will appear here when data is loaded</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border border-gray-300 rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Generating density map...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Low density</span>
          <div className="flex h-4 w-32 rounded overflow-hidden">
            <div className="w-1/5 bg-blue-500"></div>
            <div className="w-1/5 bg-cyan-500"></div>
            <div className="w-1/5 bg-green-500"></div>
            <div className="w-1/5 bg-yellow-500"></div>
            <div className="w-1/5 bg-red-500"></div>
          </div>
          <span>High density</span>
        </div>
      </div>
    </div>
  );
}