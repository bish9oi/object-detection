import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface DetectionResult {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  area: number;
  aspectRatio: number;
  trackId?: number;
  timestamp: number;
}

export class ObjectDetector {
  private model: cocoSsd.ObjectDetection | null = null;
  private isLoading = false;
  private trackingId = 0;
  private previousDetections: DetectionResult[] = [];

  async loadModel(): Promise<void> {
    if (this.model || this.isLoading) return;
    
    this.isLoading = true;
    try {
      // Set TensorFlow.js backend
      await tf.setBackend('webgl');
      await tf.ready();
      
      // Load COCO-SSD model
      this.model = await cocoSsd.load({
        base: 'mobilenet_v2',
        modelUrl: undefined
      });
      
      console.log('Object detection model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async detectObjects(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<DetectionResult[]> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      const predictions = await this.model.detect(imageElement);
      const timestamp = Date.now();
      
      const detections: DetectionResult[] = predictions.map((prediction, index) => {
        const [x, y, width, height] = prediction.bbox;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const area = width * height;
        const aspectRatio = width / height;

        return {
          id: `${timestamp}-${index}`,
          label: prediction.class,
          confidence: prediction.score,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
          centerX: Math.round(centerX),
          centerY: Math.round(centerY),
          area: Math.round(area),
          aspectRatio: Math.round(aspectRatio * 100) / 100,
          timestamp
        };
      });

      // Add tracking IDs based on proximity to previous detections
      const trackedDetections = this.assignTrackingIds(detections);
      this.previousDetections = trackedDetections;

      return trackedDetections;
    } catch (error) {
      console.error('Error during detection:', error);
      return [];
    }
  }

  private assignTrackingIds(currentDetections: DetectionResult[]): DetectionResult[] {
    const trackedDetections = [...currentDetections];
    
    // Simple tracking based on proximity and class similarity
    trackedDetections.forEach(detection => {
      let bestMatch = null;
      let minDistance = Infinity;
      
      this.previousDetections.forEach(prevDetection => {
        if (prevDetection.label === detection.label) {
          const distance = Math.sqrt(
            Math.pow(detection.centerX - prevDetection.centerX, 2) +
            Math.pow(detection.centerY - prevDetection.centerY, 2)
          );
          
          if (distance < minDistance && distance < 100) { // 100px threshold
            minDistance = distance;
            bestMatch = prevDetection;
          }
        }
      });
      
      if (bestMatch) {
        detection.trackId = bestMatch.trackId;
      } else {
        detection.trackId = ++this.trackingId;
      }
    });
    
    return trackedDetections;
  }

  isModelLoaded(): boolean {
    return this.model !== null;
  }

  isModelLoading(): boolean {
    return this.isLoading;
  }
}

export const objectDetector = new ObjectDetector();