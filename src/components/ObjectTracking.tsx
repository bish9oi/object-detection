import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Users, Car, AlertTriangle } from 'lucide-react';

interface TrackedObject {
  id: number;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  firstSeen: Date;
  lastSeen: Date;
  frameCount: number;
  trajectory: { x: number; y: number; timestamp: Date }[];
}

interface ObjectTrackingProps {
  detectionResults: any[];
}

export const ObjectTracking: React.FC<ObjectTrackingProps> = ({ detectionResults }) => {
  const [trackedObjects, setTrackedObjects] = useState<TrackedObject[]>([]);
  const [totalCounts, setTotalCounts] = useState({
    person: 0,
    car: 0,
    bicycle: 0,
    truck: 0
  });

  useEffect(() => {
    if (detectionResults.length > 0) {
      const now = new Date();
      
      // Update tracked objects
      const updatedObjects = detectionResults.map((detection, index) => {
        const existingObject = trackedObjects.find(obj => obj.id === detection.trackId || obj.id === index + 1);
        
        if (existingObject) {
          return {
            ...existingObject,
            ...detection,
            lastSeen: now,
            frameCount: existingObject.frameCount + 1,
            trajectory: [
              ...existingObject.trajectory.slice(-10), // Keep last 10 positions
              { x: detection.x, y: detection.y, timestamp: now }
            ]
          };
        } else {
          return {
            id: detection.trackId || index + 1,
            ...detection,
            firstSeen: now,
            lastSeen: now,
            frameCount: 1,
            trajectory: [{ x: detection.x, y: detection.y, timestamp: now }]
          };
        }
      });

      setTrackedObjects(updatedObjects);

      // Update counts
      const counts = { person: 0, car: 0, bicycle: 0, truck: 0 };
      updatedObjects.forEach(obj => {
        const label = obj.label.toLowerCase();
        if (label.includes('person')) counts.person++;
        else if (label.includes('car')) counts.car++;
        else if (label.includes('bicycle')) counts.bicycle++;
        else if (label.includes('truck')) counts.truck++;
      });
      setTotalCounts(counts);
    }
  }, [detectionResults]);

  const getObjectIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('person')) return Users;
    if (lowerLabel.includes('car')) return Car;
    return Target;
  };

  const getTrajectoryPath = (trajectory: { x: number; y: number }[]) => {
    if (trajectory.length < 2) return '';
    
    return trajectory.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Target className="h-6 w-6 text-green-400" />
        Object Tracking & Counting
      </h3>

      {/* Real-time Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalCounts.person}</div>
          <div className="text-sm text-gray-400">People</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <Car className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalCounts.car}</div>
          <div className="text-sm text-gray-400">Cars</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalCounts.bicycle}</div>
          <div className="text-sm text-gray-400">Bicycles</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{trackedObjects.length}</div>
          <div className="text-sm text-gray-400">Total Tracked</div>
        </div>
      </div>

      {/* Tracked Objects List */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-4">Active Tracks</h4>
        {trackedObjects.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {trackedObjects.map((obj) => {
              const Icon = getObjectIcon(obj.label);
              const duration = Math.round((obj.lastSeen.getTime() - obj.firstSeen.getTime()) / 1000);
              
              return (
                <div key={obj.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-white">ID: {obj.id}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{obj.label}</div>
                      <div className="text-sm text-gray-400">
                        Confidence: {Math.round(obj.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      Duration: {duration}s
                    </div>
                    <div className="text-sm text-gray-400">
                      Frames: {obj.frameCount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No objects currently being tracked</p>
            <p className="text-sm mt-2">Start detection to see tracked objects</p>
          </div>
        )}
      </div>

      {/* Trajectory Visualization */}
      {trackedObjects.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4">Movement Trajectories</h4>
          <div className="bg-white/5 rounded-lg p-4 h-32 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full">
              {trackedObjects.map((obj, index) => (
                <g key={obj.id}>
                  <path
                    d={getTrajectoryPath(obj.trajectory)}
                    stroke={`hsl(${index * 60}, 70%, 60%)`}
                    strokeWidth="2"
                    fill="none"
                    opacity="0.7"
                  />
                  {obj.trajectory.length > 0 && (
                    <circle
                      cx={obj.trajectory[obj.trajectory.length - 1]?.x || 0}
                      cy={obj.trajectory[obj.trajectory.length - 1]?.y || 0}
                      r="4"
                      fill={`hsl(${index * 60}, 70%, 60%)`}
                    />
                  )}
                </g>
              ))}
            </svg>
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              Real-time movement paths
            </div>
          </div>
        </div>
      )}
    </div>
  );
};