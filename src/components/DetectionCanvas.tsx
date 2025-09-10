import React, { useRef, useEffect } from 'react';
import { DetectionResult } from '../utils/objectDetection';

interface DetectionCanvasProps {
  imageElement: HTMLImageElement | HTMLVideoElement | null;
  detections: DetectionResult[];
  width: number;
  height: number;
  showLabels?: boolean;
  showConfidence?: boolean;
  showDimensions?: boolean;
}

export const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  imageElement,
  detections,
  width,
  height,
  showLabels = true,
  showConfidence = true,
  showDimensions = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw the image/video frame
    ctx.drawImage(imageElement, 0, 0, width, height);

    // Draw detection boxes and labels
    detections.forEach((detection, index) => {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      const color = colors[index % colors.length];

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);

      // Draw filled background for text
      const labelText = `${detection.label} (${Math.round(detection.confidence * 100)}%)`;
      const dimensionText = `${detection.width}×${detection.height}px`;
      const areaText = `Area: ${detection.area}px²`;
      
      ctx.font = '14px Arial';
      const labelWidth = ctx.measureText(labelText).width;
      const dimensionWidth = ctx.measureText(dimensionText).width;
      const maxWidth = Math.max(labelWidth, dimensionWidth) + 10;

      // Background rectangle
      ctx.fillStyle = color;
      ctx.fillRect(detection.x, detection.y - 60, maxWidth, 55);

      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      
      if (showLabels && showConfidence) {
        ctx.fillText(labelText, detection.x + 5, detection.y - 40);
      }
      
      if (showDimensions) {
        ctx.font = '12px Arial';
        ctx.fillText(dimensionText, detection.x + 5, detection.y - 25);
        ctx.fillText(areaText, detection.x + 5, detection.y - 10);
      }

      // Draw center point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(detection.centerX, detection.centerY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw tracking ID if available
      if (detection.trackId) {
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`ID: ${detection.trackId}`, detection.x + detection.width - 40, detection.y + 15);
      }
    });
  }, [imageElement, detections, width, height, showLabels, showConfidence, showDimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-auto border border-gray-600 rounded-lg"
    />
  );
};