import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { Filter, Loader2, AlertTriangle } from 'lucide-react';
import MainLayout from './MainLayout';
import { supabaseService } from '../config/supabase';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
 
// Types
interface Report {
  id: string;
  location: { lat: number; lng: number };
  type: string;
  status: string;
  priority: string;
  description?: string;
  timestamp: string;
  affected_people?: number;
  resource_requirements?: Record<string, unknown>;
  magnitude?: number;
  depth?: number;
  source?: string;
  animationPhase?: number;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  count?: number;
  totalAffected?: number;
}

interface ResourceAnalysis {
  lat: number;
  lng: number;
  totalAffected: number;
  resources?: Record<string, unknown>;
  totalReports?: number;
}

interface Filters {
  type?: string;
  status?: string;
  priority?: string;
}


// India center coordinates
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const REAL_TIME_UPDATE_INTERVAL = 30000; // 30 seconds

// Real-time disaster data fetching service
const fetchRealTimeDisasters = async () => {
  const disasters: Report[] = [];
  
  try {
    // USGS Earthquake API - Recent earthquakes (last hour, magnitude 4.5+)
    const earthquakeResponse = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + 
      new Date(Date.now() - 3600000).toISOString() + '&minmagnitude=4.5&limit=20');
    const earthquakeData = await earthquakeResponse.json();
    
    earthquakeData.features.forEach((quake: any) => {
      const [lng, lat] = quake.geometry.coordinates;
      disasters.push({
        id: `usgs_${quake.id}`,
        location: { lat, lng },
        type: 'earthquake',
        status: 'active',
        priority: quake.properties.mag >= 6.0 ? 'high' : quake.properties.mag >= 5.0 ? 'medium' : 'low',
        description: `Magnitude ${quake.properties.mag} earthquake at ${quake.properties.depth}km depth`,
        timestamp: quake.properties.time,
        magnitude: quake.properties.mag,
        depth: quake.properties.depth,
        source: 'USGS',
        affected_people: Math.floor(Math.pow(10, quake.properties.mag - 3)) // Rough estimation
      });
    });
  } catch (error) {
    console.error('Error fetching USGS earthquake data:', error);
  }
  
  try {
    // Mock GDACS disaster data for demonstration
    const mockGDACSData = [
      { lat: 28.6139, lng: 77.2090, type: 'flood', severity: 'high', location: 'New Delhi, India' },
      { lat: 19.0760, lng: 72.8777, type: 'cyclone', severity: 'medium', location: 'Mumbai, India' },
      { lat: 13.0827, lng: 80.2707, type: 'flood', severity: 'low', location: 'Chennai, India' }
    ];
    
    mockGDACSData.forEach((disaster, index) => {
      disasters.push({
        id: `gdacs_${index}`,
        location: { lat: disaster.lat, lng: disaster.lng },
        type: disaster.type,
        status: 'active',
        priority: disaster.severity,
        description: `${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)} in ${disaster.location}`,
        timestamp: new Date().toISOString(),
        source: 'GDACS',
        affected_people: Math.floor(Math.random() * 10000) + 1000
      });
    });
  } catch (error) {
    console.error('Error fetching GDACS data:', error);
  }
  
  return disasters;
};

// Animated Reports Layer Component
const AnimatedReportsLayer: React.FC<{ reports: Report[]; loading: boolean }> = ({ reports, loading }) => {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Helper function to get disaster colors
  const getDisasterColor = (type: string, priority: string): string => {
    const colors: Record<string, Record<string, string>> = {
      earthquake: { high: '#FF0000', medium: '#FF6B00', low: '#FFA500' },
      flood: { high: '#0066CC', medium: '#3399FF', low: '#66B2FF' },
      cyclone: { high: '#9900CC', medium: '#CC33FF', low: '#E699FF' },
      fire: { high: '#FF3300', medium: '#FF6600', low: '#FF9900' },
      landslide: { high: '#8B4513', medium: '#A0522D', low: '#CD853F' },
      default: { high: '#FF0000', medium: '#FFA500', low: '#FFFF00' }
    };
    return colors[type]?.[priority] || colors.default[priority];
  };

  // Helper function to create popup content
  const createPopupContent = (report: Report): string => {
    return `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center mb-2">
          <div class="w-3 h-3 rounded-full mr-2" style="background: ${getDisasterColor(report.type, report.priority)}"></div>
          <h3 class="font-bold text-lg capitalize">${report.type}</h3>
        </div>
        <p class="text-sm text-gray-600 mb-2">${report.description || 'No description available'}</p>
        <div class="space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="font-medium">Status:</span>
            <span class="px-2 py-1 rounded-full bg-${report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'yellow' : 'green'}-100 text-${report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'yellow' : 'green'}-800">
              ${report.status}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Priority:</span>
            <span class="capitalize font-medium">${report.priority}</span>
          </div>
          ${report.magnitude ? `
            <div class="flex justify-between">
              <span class="font-medium">Magnitude:</span>
              <span class="font-medium">${report.magnitude}</span>
            </div>
          ` : ''}
          ${report.depth ? `
            <div class="flex justify-between">
              <span class="font-medium">Depth:</span>
              <span class="font-medium">${report.depth}km</span>
            </div>
          ` : ''}
          ${report.affected_people ? `
            <div class="flex justify-between">
              <span class="font-medium">Affected:</span>
              <span class="font-medium">${report.affected_people.toLocaleString()}</span>
            </div>
          ` : ''}
          <div class="flex justify-between">
            <span class="font-medium">Source:</span>
            <span class="font-medium">${report.source || 'Local'}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Updated:</span>
            <span class="font-medium">${new Date(report.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (loading || !reports.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current.clear();

    // Add CSS animations if not already present
    if (!document.getElementById('disaster-map-animations')) {
      const style = document.createElement('style');
      style.id = 'disaster-map-animations';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        .disaster-marker {
          z-index: 1000 !important;
        }
        
        .disaster-wave {
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }

    reports.forEach((report) => {
      // Create animated marker
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="disaster-marker disaster-${report.type}" 
               style="
                 width: 20px;
                 height: 20px;
                 border-radius: 50%;
                 background: ${getDisasterColor(report.type, report.priority)};
                 border: 2px solid white;
                 box-shadow: 0 0 10px rgba(255,255,255,0.8);
                 animation: pulse 2s infinite;
                 position: relative;
               ">
            <div class="disaster-wave" 
                 style="
                   position: absolute;
                   top: 50%;
                   left: 50%;
                   transform: translate(-50%, -50%);
                   width: 30px;
                   height: 30px;
                   border-radius: 50%;
                   border: 2px solid ${getDisasterColor(report.type, report.priority)};
                   animation: ripple 2s infinite;
                 ">
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      const marker = L.marker([report.location.lat, report.location.lng], { icon })
        .addTo(map)
        .bindPopup(createPopupContent(report));
      
      markersRef.current.set(report.id, marker);
    });

    return () => {
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current.clear();
    };
  }, [reports, loading, map]);

  return null;
};

// Heatmap Layer Component
const HeatmapLayer: React.FC<{ heatmapData: HeatmapPoint[]; loading: boolean }> = ({ heatmapData, loading }) => {
  const map = useMap();

  useEffect(() => {
    if (loading || !heatmapData.length) return;

    // @ts-expect-error leaflet.heat plugin type definitions may be incomplete
    const heatLayer = L.heatLayer(
      heatmapData.map(point => [point.lat, point.lng, point.intensity]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [heatmapData, loading, map]);

  return null;
};

// Resource Analysis Layer Component
const ResourceAnalysisLayer: React.FC<{ resourceData: ResourceAnalysis[]; loading: boolean }> = ({ resourceData, loading }) => {
  const map = useMap();

  useEffect(() => {
    if (loading || !resourceData.length) return;

    const circles: L.Circle[] = [];

    resourceData.forEach((resource) => {
      const radius = Math.sqrt(resource.totalAffected) * 100; // Scale the radius
      const circle = L.circle([resource.lat, resource.lng], {
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.5,
        radius: radius
      })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-lg">Resource Analysis</h3>
            <p class="text-sm">Total Affected: ${resource.totalAffected}</p>
            <p class="text-sm">Total Reports: ${resource.totalReports || 0}</p>
            ${resource.resources ? `
              <div class="mt-2">
                <strong>Resources Needed:</strong>
                <ul class="list-disc list-inside text-sm">
                  ${Object.entries(resource.resources).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `);
      circles.push(circle);
    });

    return () => {
      circles.forEach(circle => map.removeLayer(circle));
    };
  }, [resourceData, loading, map]);

  return null;
};

// Filter Panel Component - Mobile Responsive (Stacked below stats on mobile)
const FilterPanel: React.FC<{
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  disasterTypes: string[];
  loading: boolean;
}> = ({ filters, onFiltersChange, disasterTypes, loading }) => {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="absolute top-4 left-4 md:top-44 md:right-4 md:left-auto z-[1000] bg-white p-3 sm:p-4 rounded-lg shadow-lg w-64 sm:w-72 md:w-64 max-w-[calc(100vw-2rem)]">
      <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4 flex items-center">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-600" />
        Filters
      </h3>

      <div className="space-y-2 sm:space-y-3">
        <div>
          <label htmlFor="disaster-type-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Disaster Type</label>
          <select
            id="disaster-type-select"
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">All Types</option>
            {disasterTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="disaster-status-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="disaster-status-select"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label htmlFor="disaster-priority-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            id="disaster-priority-select"
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Disaster Statistics Panel Component - Mobile Responsive
const DisasterStatisticsPanel: React.FC<{ reports: Report[]; loading: boolean }> = ({ reports, loading }) => {
  if (loading) return null;

  const totalReports = reports.length;
  const activeReports = reports.filter(r => r.status === 'active').length;
  const highPriorityReports = reports.filter(r => r.priority === 'high').length;
  const totalAffected = reports.reduce((sum, r) => sum + (r.affected_people || 0), 0);

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-3 sm:p-4 rounded-lg shadow-lg w-64 sm:w-72 md:w-80 max-w-[calc(100vw-2rem)]">
      <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-orange-500" />
        Statistics
      </h3>
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex justify-between text-xs sm:text-sm">
          <span>Total Reports:</span>
          <span className="font-medium">{totalReports}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span>Active:</span>
          <span className="font-medium text-orange-600">{activeReports}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span>High Priority:</span>
          <span className="font-medium text-red-600">{highPriorityReports}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span>Affected:</span>
          <span className="font-medium text-blue-600">{totalAffected.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Main Disaster Heat Map Component
const DisasterHeatMap: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [realtimeReports, setRealtimeReports] = useState<Report[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [resourceData, setResourceData] = useState<ResourceAnalysis[]>([]);
  const [disasterTypes, setDisasterTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeEnabled] = useState(true);

  // Fetch real-time disaster data
  const fetchRealTimeData = useCallback(async () => {
    if (!isRealTimeEnabled) return;
    
    try {
      const realtimeDisasters = await fetchRealTimeDisasters();
      setRealtimeReports(realtimeDisasters);
      console.log(`\ud83c\udf0d Real-time disasters fetched: ${realtimeDisasters.length}`);
      
      // Save important disasters to Supabase for persistence
      if (realtimeDisasters.length > 0) {
        await saveImportantDisastersToSupabase(realtimeDisasters);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  }, [isRealTimeEnabled]);

  // Save important disasters to Supabase
  const saveImportantDisastersToSupabase = async (disasters: Report[]) => {
    try {
      const importantDisasters = disasters.filter(d => 
        d.priority === 'high' || 
        d.type === 'earthquake' || 
        d.affected_people && d.affected_people > 1000
      );
      
      for (const disaster of importantDisasters) {
        await supabaseService.saveDisasterRecord({
          type: disaster.type,
          severity: disaster.priority,
          location: {
            lat: disaster.location.lat,
            lng: disaster.location.lng,
            address: `${disaster.location.lat.toFixed(4)}, ${disaster.location.lng.toFixed(4)}`
          },
          status: 'active',
          affected_population: disaster.affected_people || 0,
          description: disaster.description || '',
          source: disaster.source === 'USGS' ? 'usgs' : disaster.source === 'GDACS' ? 'gdacs' : 'local'
        });
      }
      
      console.log(`\u2703 Saved ${importantDisasters.length} important disasters to Supabase`);
    } catch (error) {
      console.error('Error saving disasters to Supabase:', error);
    }
  };

  // Fetch data function - HYBRID DATA MODEL: Merge MongoDB + DMC floods
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      // HYBRID: Fetch both MongoDB reports and external DMC flood data
      const [disastersRes, floodsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/public/disasters`),
        axios.get(`${API_BASE_URL}/api/public/flood-alerts`).catch(() => ({ data: { success: false, data: [] } }))
      ]);

      const mongoDisasters = disastersRes.data.success ? disastersRes.data.data.filter((d: any) => d.status === 'active') : [];
      const dmcFloods = floodsRes.data.success ? floodsRes.data.data : [];

      // Convert disasters to reports format for backward compatibility
      const mongoReports = mongoDisasters.map((d: any) => ({
        id: d._id,
        location: d.location,
        type: d.type,
        status: d.status,
        priority: d.severity,
        description: d.description,
        timestamp: d.created_at,
        affected_people: d.affected_population,
        source: 'Local Database'
      }));

      // Merge reports from MongoDB and DMC floods (convert floods to report format)
      const mergedReports = [
        ...mongoReports,
        ...dmcFloods.map((flood: any) => ({
          id: flood.id || flood._id,
          location: { lat: flood.lat, lng: flood.lng },
          type: 'flood',
          status: flood.alert_status || flood.severity,
          priority: flood.severity === 'critical' ? 'high' : flood.severity === 'high' ? 'medium' : 'low',
          description: `${flood.location} - Water level: ${flood.water_level}m`,
          timestamp: flood.timestamp,
          source: 'DMC API'
        }))
      ];

      // Combine with real-time reports
      const allReports = [...mergedReports, ...realtimeReports];

      console.log(`\u2705 Enhanced Heat Map: ${mongoReports.length} local + ${dmcFloods.length} DMC + ${realtimeReports.length} real-time = ${allReports.length} total`);

      setReports(allReports);
      // Generate heatmap data from all reports
      const heatmapPoints = allReports.map((r: any) => ({
        lat: r.location.lat,
        lng: r.location.lng,
        intensity: r.priority === 'high' ? 1.0 : r.priority === 'medium' ? 0.6 : 0.3
      }));
      setHeatmapData(heatmapPoints);
      setResourceData([]);
      setDisasterTypes([...new Set(allReports.map((r: Report) => r.type))]);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Failed to load map data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, realtimeReports]);

  // Set up real-time updates
  useEffect(() => {
    fetchRealTimeData(); // Initial fetch
    
    const interval = setInterval(fetchRealTimeData, REAL_TIME_UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchRealTimeData]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <MainLayout>
      <div className="p-3 sm:p-4 md:p-6 h-full">
        <div className="max-w-7xl mx-auto h-full">
          {/* Page Header - Mobile Responsive */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Disaster Heat Map</h1>
              {loading && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout: Stack cards below map | Desktop: Cards overlay map */}
          <div className="flex flex-col lg:block h-auto lg:h-[calc(100vh-140px)]">
            {/* Statistics and Filters - Stacked on mobile, positioned below header */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3 lg:hidden">
              <div className="flex-1 bg-white p-3 rounded-lg shadow-lg">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-orange-500" />
                  Statistics
                </h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Total Reports:</span>
                    <span className="font-medium">{reports.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Active:</span>
                    <span className="font-medium text-orange-600">{reports.filter(r => r.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>High Priority:</span>
                    <span className="font-medium text-red-600">{reports.filter(r => r.priority === 'high').length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Affected:</span>
                    <span className="font-medium text-blue-600">{reports.reduce((sum, r) => sum + (r.affected_people || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-white p-3 rounded-lg shadow-lg">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <Filter className="w-4 h-4 mr-1.5 text-blue-600" />
                  Filters
                </h3>
                <div className="space-y-2">
                  <label htmlFor="mobile-disaster-type" className="block text-xs font-medium text-gray-700 mb-1">Disaster Type</label>
                  <select
                    id="mobile-disaster-type"
                    value={filters.type || ''}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                    className="w-full p-1.5 border border-gray-300 rounded-md text-xs"
                    disabled={loading}
                  >
                    <option value="">All Types</option>
                    {disasterTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <label htmlFor="mobile-disaster-status" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="mobile-disaster-status"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                    className="w-full p-1.5 border border-gray-300 rounded-md text-xs"
                    disabled={loading}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="pending">Pending</option>
                  </select>
                  <label htmlFor="mobile-disaster-priority" className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    id="mobile-disaster-priority"
                    value={filters.priority || ''}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
                    className="w-full p-1.5 border border-gray-300 rounded-md text-xs"
                    disabled={loading}
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[500px] lg:h-full relative">
              {error && (
                <div className="absolute top-4 right-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Desktop Only: Overlay statistics and filters */}
              <div className="hidden lg:block">
                <DisasterStatisticsPanel reports={reports} loading={loading} />
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  disasterTypes={disasterTypes}
                  loading={loading}
                />
              </div>

              <MapContainer
                center={INDIA_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                className="z-0 rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <AnimatedReportsLayer reports={reports} loading={loading} />
                <HeatmapLayer heatmapData={heatmapData} loading={loading} />
                <ResourceAnalysisLayer resourceData={resourceData} loading={loading} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DisasterHeatMap;
