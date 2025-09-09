import React, { useState, useRef } from 'react';
import { Target, Github, Star, TrendingUp, Eye, Car, Shield, Cpu } from 'lucide-react';
import { DetectionModes } from './components/DetectionModes';
import { ObjectTracking } from './components/ObjectTracking';
import { ROIAlerts } from './components/ROIAlerts';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

interface DetectionResult {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('detection');
  const [currentMode, setCurrentMode] = useState('image');
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);

  const applications = [
    {
      icon: Car,
      title: "Autonomous Vehicles",
      description: "Real-time detection of pedestrians, vehicles, and traffic signs for safe self-driving navigation",
      stats: "99.2% accuracy",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Shield,
      title: "Security Surveillance",
      description: "24/7 monitoring with instant threat detection and automated alert systems",
      stats: "< 10ms latency",
      color: "from-red-500 to-pink-400"
    },
    {
      icon: Cpu,
      title: "Edge Computing",
      description: "Lightweight architecture optimized for IoT devices and embedded systems",
      stats: "5MB model size",
      color: "from-green-500 to-emerald-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30"></div>
                <Target className="relative h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              YOLO<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">v10</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Revolutionary real-time object detection with unprecedented speed and accuracy. 
              Powering the future of computer vision across industries.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{'< 1ms'}</div>
                <div className="text-gray-400">Inference Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">95.2%</div>
                <div className="text-gray-400">mAP Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
                <div className="text-gray-400">GitHub Stars</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setActiveTab('detection')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'detection'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Detection
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'tracking'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Tracking & ROI
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'applications'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Applications
            </button>
          </div>
        </div>

        {/* Detection Tab */}
        {activeTab === 'detection' && (
          <div className="mb-12">
            <DetectionModes 
              onDetectionResults={setDetectionResults}
              onModeChange={setCurrentMode}
            />
          </div>
        )}

        {/* Tracking & ROI Tab */}
        {activeTab === 'tracking' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            <ObjectTracking detectionResults={detectionResults} />
            <ROIAlerts detectionResults={detectionResults} />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="mb-12">
            <AnalyticsDashboard />
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {applications.map((app, index) => (
              <div key={index} className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${app.color} mb-6`}>
                    <app.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{app.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{app.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-400">{app.stats}</span>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GitHub Section */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center mb-12">
          <Github className="h-16 w-16 text-white mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Open Source & Community Driven</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and researchers contributing to the future of computer vision. 
            Access pre-trained models, comprehensive documentation, and active community support.
          </p>
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-semibold">50,247 Stars</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-white font-semibold">12.3k Forks</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-400" />
              <span className="text-white font-semibold">1.2k Watching</span>
            </div>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
            View on GitHub
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 YOLOv10 Demo. Revolutionizing computer vision with real-time object detection.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;