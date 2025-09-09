import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Download, 
  Calendar,
  Users,
  Car,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  hourlyDetections: { hour: number; count: number }[];
  objectCounts: { [key: string]: number };
  alertHistory: { timestamp: Date; type: string; count: number }[];
  performanceMetrics: {
    avgInferenceTime: number;
    fps: number;
    accuracy: number;
    uptime: number;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    hourlyDetections: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 100) + 20
    })),
    objectCounts: {
      person: 1247,
      car: 892,
      bicycle: 156,
      truck: 89,
      motorcycle: 67,
      bus: 23
    },
    alertHistory: Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000),
      type: ['security', 'traffic', 'anomaly'][Math.floor(Math.random() * 3)],
      count: Math.floor(Math.random() * 10) + 1
    })),
    performanceMetrics: {
      avgInferenceTime: 0.8,
      fps: 1250,
      accuracy: 95.2,
      uptime: 99.7
    }
  });

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    // Simulate data export
    const data = {
      timestamp: new Date().toISOString(),
      timeRange,
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yolov10-analytics-${timeRange}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'text-red-400 bg-red-400/10';
      case 'traffic': return 'text-yellow-400 bg-yellow-400/10';
      case 'anomaly': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-400" />
          Analytics Dashboard
        </h2>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-white/10 rounded-lg p-1">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* Export Button */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200">
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => exportData('csv')}
                className="block w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-t-lg"
              >
                Export as CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="block w-full px-4 py-2 text-left text-white hover:bg-white/10"
              >
                Export as JSON
              </button>
              <button
                onClick={() => exportData('pdf')}
                className="block w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-b-lg"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-blue-400" />
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analyticsData.performanceMetrics.avgInferenceTime}ms
          </div>
          <div className="text-sm text-gray-400">Avg Inference Time</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-green-400" />
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analyticsData.performanceMetrics.fps}
          </div>
          <div className="text-sm text-gray-400">Max FPS</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analyticsData.performanceMetrics.accuracy}%
          </div>
          <div className="text-sm text-gray-400">Detection Accuracy</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analyticsData.performanceMetrics.uptime}%
          </div>
          <div className="text-sm text-gray-400">System Uptime</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hourly Detections Chart */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Hourly Detection Count</h3>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
              {analyticsData.hourlyDetections.slice(0, 12).map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-400 hover:to-blue-300"
                    style={{ height: `${(data.count / 100) * 150}px` }}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2">{data.hour}h</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Object Distribution */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Object Detection Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.objectCounts).map(([object, count], index) => {
              const percentage = (count / Object.values(analyticsData.objectCounts).reduce((a, b) => a + b, 0)) * 100;
              const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400', 'bg-red-400', 'bg-pink-400'];
              
              return (
                <div key={object} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                    <span className="text-white capitalize">{object}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          Recent Alert History
        </h3>
        <div className="space-y-3">
          {analyticsData.alertHistory.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                  {alert.type.toUpperCase()}
                </div>
                <div className="text-white">
                  {alert.count} alert{alert.count > 1 ? 's' : ''} triggered
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                {alert.timestamp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">Online</div>
            <div className="text-gray-400">System Status</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4</div>
            <div className="text-gray-400">Active Cameras</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">2.1GB</div>
            <div className="text-gray-400">Memory Usage</div>
          </div>
        </div>
      </div>
    </div>
  );
};