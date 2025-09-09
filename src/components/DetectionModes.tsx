import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Video, Monitor, Play, Pause, Square, Settings } from 'lucide-react';

interface DetectionResult {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  trackId?: number;
}

interface DetectionModesProps {
  onDetectionResults: (results: DetectionResult[]) => void;
  onModeChange: (mode: string) => void;
}

export const DetectionModes: React.FC<DetectionModesProps> = ({ onDetectionResults, onModeChange }) => {
  const [activeMode, setActiveMode] = useState<'image' | 'video' | 'stream'>('image');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mockDetections: DetectionResult[] = [
    { id: '1', label: 'Person', confidence: 0.96, x: 120, y: 80, width: 180, height: 320, trackId: 1 },
    { id: '2', label: 'Car', confidence: 0.91, x: 350, y: 200, width: 220, height: 140, trackId: 2 },
    { id: '3', label: 'Traffic Light', confidence: 0.88, x: 580, y: 60, width: 60, height: 120, trackId: 3 },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(e.target?.result as string);
        setIsProcessing(true);
        
        // Simulate processing time
        setTimeout(() => {
          onDetectionResults(mockDetections);
          setIsProcessing(false);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const startStreamDetection = async () => {
    setIsProcessing(true);
    onModeChange('stream');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Simulate real-time detections
      const interval = setInterval(() => {
        const randomDetections = mockDetections.map(det => ({
          ...det,
          confidence: Math.max(0.7, Math.random()),
          x: det.x + (Math.random() - 0.5) * 20,
          y: det.y + (Math.random() - 0.5) * 20,
        }));
        onDetectionResults(randomDetections);
      }, 500);

      return () => {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsProcessing(false);
    }
  };

  const stopStreamDetection = () => {
    setIsProcessing(false);
    onDetectionResults([]);
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
                    src={uploadedFile} 
                    alt="Uploaded" 
                    className="max-w-full h-auto rounded-lg mx-auto"
                    style={{ maxHeight: '400px' }}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p>Processing image...</p>
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
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                muted
                playsInline
              />
              {!isProcessing && (
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
                onClick={isProcessing ? stopStreamDetection : startStreamDetection}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isProcessing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isProcessing ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isProcessing ? 'Stop Stream' : 'Start Camera'}
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};