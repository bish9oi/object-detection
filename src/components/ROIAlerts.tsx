import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, MapPin, Shield, Plus, Trash2, Eye } from 'lucide-react';

interface ROIZone {
  id: string;
  name: string;
  type: 'restricted' | 'monitored' | 'counting';
  coordinates: { x: number; y: number; width: number; height: number };
  alertCount: number;
  isActive: boolean;
  color: string;
}

interface ROIAlertsProps {
  detectionResults: any[];
  imageWidth?: number;
  imageHeight?: number;
}

export const ROIAlerts: React.FC<ROIAlertsProps> = ({ 
  detectionResults, 
  imageWidth = 640, 
  imageHeight = 480 
}) => {
  const [zones, setZones] = useState<ROIZone[]>([
    {
      id: '1',
      name: 'Restricted Area',
      type: 'restricted',
      coordinates: { x: 100, y: 100, width: 200, height: 150 },
      alertCount: 0,
      isActive: true,
      color: '#ef4444'
    },
    {
      id: '2',
      name: 'Monitoring Zone',
      type: 'monitored',
      coordinates: { x: 350, y: 200, width: 180, height: 120 },
      alertCount: 0,
      isActive: true,
      color: '#f59e0b'
    }
  ]);

  const [alerts, setAlerts] = useState<Array<{
    id: string;
    zoneName: string;
    objectType: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [newZone, setNewZone] = useState<Partial<ROIZone> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for zone violations
  useEffect(() => {
    detectionResults.forEach(detection => {
      zones.forEach(zone => {
        if (!zone.isActive) return;

        const detectionCenter = {
          x: detection.x + detection.width / 2,
          y: detection.y + detection.height / 2
        };

        const isInZone = (
          detectionCenter.x >= zone.coordinates.x &&
          detectionCenter.x <= zone.coordinates.x + zone.coordinates.width &&
          detectionCenter.y >= zone.coordinates.y &&
          detectionCenter.y <= zone.coordinates.y + zone.coordinates.height
        );

        if (isInZone && zone.type === 'restricted') {
          const newAlert = {
            id: `${Date.now()}-${detection.id}`,
            zoneName: zone.name,
            objectType: detection.label,
            timestamp: new Date(),
            severity: 'high' as const
          };

          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
          
          // Update zone alert count
          setZones(prev => prev.map(z => 
            z.id === zone.id ? { ...z, alertCount: z.alertCount + 1 } : z
          ));
        }
      });
    });
  }, [detectionResults, zones]);

  const addZone = () => {
    const newZoneData: ROIZone = {
      id: Date.now().toString(),
      name: `Zone ${zones.length + 1}`,
      type: 'monitored',
      coordinates: { x: 50, y: 50, width: 150, height: 100 },
      alertCount: 0,
      isActive: true,
      color: '#10b981'
    };
    setZones(prev => [...prev, newZoneData]);
  };

  const removeZone = (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  const toggleZone = (zoneId: string) => {
    setZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, isActive: !z.isActive } : z
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  const getZoneTypeIcon = (type: string) => {
    switch (type) {
      case 'restricted': return AlertTriangle;
      case 'monitored': return Eye;
      case 'counting': return MapPin;
      default: return Shield;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Shield className="h-6 w-6 text-red-400" />
        Region of Interest (ROI) Alerts
      </h3>

      {/* Zone Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Zone Visualization */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Detection Zones</h4>
            <button
              onClick={addZone}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Add Zone
            </button>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={imageWidth}
              height={imageHeight}
              className="w-full h-64 object-contain border border-gray-600"
            />
            
            {/* Zone Overlays */}
            <svg 
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${imageWidth} ${imageHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {zones.map(zone => (
                <g key={zone.id}>
                  <rect
                    x={zone.coordinates.x}
                    y={zone.coordinates.y}
                    width={zone.coordinates.width}
                    height={zone.coordinates.height}
                    fill={zone.color}
                    fillOpacity={zone.isActive ? 0.2 : 0.1}
                    stroke={zone.color}
                    strokeWidth="2"
                    strokeDasharray={zone.isActive ? "0" : "5,5"}
                  />
                  <text
                    x={zone.coordinates.x + 5}
                    y={zone.coordinates.y + 20}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {zone.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Zone Controls */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Zone Configuration</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {zones.map(zone => {
              const Icon = getZoneTypeIcon(zone.type);
              return (
                <div key={zone.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" style={{ color: zone.color }} />
                      <div>
                        <div className="text-white font-medium">{zone.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{zone.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleZone(zone.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                          zone.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => removeZone(zone.id)}
                        className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    Alerts: <span className="text-red-400 font-semibold">{zone.alertCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          Recent Alerts
        </h4>
        
        {alerts.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      {alert.objectType} detected in {alert.zoneName}
                    </div>
                    <div className="text-sm text-gray-400">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No alerts generated</p>
            <p className="text-sm mt-2">Zones are monitoring for violations</p>
          </div>
        )}
      </div>
    </div>
  );
};