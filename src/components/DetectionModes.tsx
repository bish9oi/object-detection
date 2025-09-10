import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Video, Monitor, Play, Pause, Square, Settings } from 'lucide-react';
import { objectDetector, DetectionResult } from '../utils/objectDetection';
import { DetectionCanvas } from './DetectionCanvas';


interface DetectionModesProps {
  onDetectionResults: (results: DetectionResult[]) => void;
  onModeChange: (mode: string) => void;
}

export const DetectionModes: React.FC<DetectionModesProps> = ({ onDetectionResults, onModeChange }) => {
  const [activeMode, setActiveMode] = useState<'image' | 'video' | 'stream'>('image');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [streamActive, setStreamActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationFrameRef = useRef<number>();

  // Load model on component mount
  useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      try {
        await objectDetector.loadModel();
      } catch (error) {
        console.error('Failed to load detection model:', error);
      } finally {
        setIsModelLoading(false);
      }
    };
    
    loadModel();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(e.target?.result as string);
        // Image will be processed when it loads
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageElement: HTMLImageElement) => {
    if (!objectDetector.isModelLoaded()) {
      console.error('Model not loaded yet');
      return;
    }

    setIsProcessing(true);
    try {
      const results = await objectDetector.detectObjects(imageElement);
      setDetections(results);
      onDetectionResults(results);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processVideoFrame = async () => {
    if (!videoRef.current || !objectDetector.isModelLoaded() || !streamActive) {
      return;
    }

    try {
      const results = await objectDetector.detectObjects(videoRef.current);
      setDetections(results);
      onDetectionResults(results);
    } catch (error) {
      console.error('Error processing video frame:', error);
    }

    if (streamActive) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
    }
  };

  const startStreamDetection = async () => {
    if (!objectDetector.isModelLoaded()) {
      alert('Detection model is still loading. Please wait...');
      return;
    }

    setStreamActive(true);
    onModeChange('stream');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        processVideoFrame(); // Start processing frames
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setStreamActive(false);
    }
  };

  const stopStreamDetection = () => {
    setStreamActive(false);
    onDetectionResults([]);
    setDetections([]);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const modes = [
    {
      id: 'image' as const,
      icon: Upload,
      title: 'Image Detection',
      description: 'Upload and analyze static images'
    },
    {
      id: 'video' as const,
      icon: Video,
      title: 'Video Processing',
      description: 'Process video files frame by frame'
    },
    {
      id: 'stream' as const,
      icon: Monitor,
      title: 'Live Stream',
      description: 'Real-time camera detection'
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Camera className="h-6 w-6 text-blue-400" />
        Detection Modes
        {isModelLoading && (
          <span className="text-sm text-yellow-400 ml-2">Loading AI Model...</span>
        )}
      </h3>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              activeMode === mode.id
                ? 'border-blue-400 bg-blue-400/10 text-white'
                : 'border-gray-600 bg-white/5 text-gray-300 hover:border-gray-500'
            }`}
          >
            <mode.icon className="h-8 w-8 mx-auto mb-3" />
            <h4 className="font-semibold mb-1">{mode.title}</h4>
            <p className="text-sm opacity-80">{mode.description}</p>
          </button>
        ))}
      </div>

      {/* Detection Interface */}
      <div className="space-y-6">
        {activeMode === 'image' && (
          <div>
            <div 
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploadedFile ? (
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={uploadedFile} 
                    alt="Uploaded" 
                    className="max-w-full h-auto rounded-lg mx-auto hidden"
                    style={{ maxHeight: '400px' }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      processImage(img);
                    }}
                  />
                  
                  {uploadedFile && (
                    <DetectionCanvas
                      imageElement={imageRef.current}
                      detections={detections}
                      width={640}
                      height={480}
                      showLabels={true}
                      showConfidence={true}
                      showDimensions={true}
                    />
                  )}
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p>Analyzing objects...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Click to upload an image</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeMode === 'video' && (
          <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-xl">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">Video processing coming soon</p>
            <p className="text-sm text-gray-500">Upload MP4, AVI, MOV files</p>
            <button className="mt-4 px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-400/30">
              Select Video File
            </button>
          </div>
        )}

        {activeMode === 'stream' && (
          <div>
            <div className="relative bg-black rounded-xl overflow-hidden">
              {streamActive ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover hidden"
                    muted
                    playsInline
                  />
                  <DetectionCanvas
                    imageElement={videoRef.current}
                    detections={detections}
                    width={640}
                    height={480}
                    showLabels={true}
                    showConfidence={true}
                    showDimensions={true}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <Monitor className="h-12 w-12 mx-auto mb-4" />
                    <p className="mb-4">Start live camera detection</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={streamActive ? stopStreamDetection : startStreamDetection}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  streamActive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {streamActive ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {streamActive ? 'Stop Stream' : 'Start Camera'}
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detection Results Summary */}
      {detections.length > 0 && (
        <div className="mt-8 bg-white/5 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Detection Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {detections.map((detection) => (
              <div key={detection.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{detection.label}</span>
                  <span className="text-green-400 text-sm">
                    {Math.round(detection.confidence * 100)}%
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>Position: ({detection.x}, {detection.y})</div>
                  <div>Size: {detection.width} × {detection.height}px</div>
                  <div>Area: {detection.area.toLocaleString()}px²</div>
                  <div>Aspect Ratio: {detection.aspectRatio}</div>
                  <div>Center: ({detection.centerX}, {detection.centerY})</div>
                  {detection.trackId && (
                    <div className="text-yellow-400">Track ID: {detection.trackId}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};