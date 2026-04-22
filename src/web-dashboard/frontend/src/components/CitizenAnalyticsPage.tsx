import React, { useState, useEffect, useCallback } from 'react';
import { Users, AlertTriangle, RefreshCw, Download, Shield, Activity, MapPin } from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart as RechartsAreaChart
} from 'recharts';
import MainLayout from './MainLayout';
import toast from 'react-hot-toast';


interface CitizenAnalyticsData {
  overview: {
    totalEmergencies: number;
    activeVolunteers: number;
    reliefCamps: number;
    peopleHelped: number;
  };
  emergenciesByType: Array<{ type: string; count: number; color: string }>;
  emergenciesByState: Array<{ state: string; count: number }>;
  responseTimeData: Array<{ time: string; avgTime: number }>;
  volunteerActivity: Array<{ day: string; volunteers: number; helped: number }>;
}

const CitizenAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<CitizenAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Mock India-oriented data for demonstration
      const mockData: CitizenAnalyticsData = {
        overview: {
          totalEmergencies: 1247,
          activeVolunteers: 8934,
          reliefCamps: 156,
          peopleHelped: 45678
        },
        emergenciesByType: [
          { type: 'Flood', count: 456, color: '#3b82f6' },
          { type: 'Medical', count: 298, color: '#ef4444' },
          { type: 'Fire', count: 187, color: '#f97316' },
          { type: 'Accident', count: 234, color: '#eab308' },
          { type: 'Other', count: 72, color: '#8b5cf6' }
        ],
        emergenciesByState: [
          { state: 'Maharashtra', count: 234 },
          { state: 'Uttar Pradesh', count: 198 },
          { state: 'Bihar', count: 176 },
          { state: 'West Bengal', count: 145 },
          { state: 'Odisha', count: 123 },
          { state: 'Kerala', count: 98 },
          { state: 'Rajasthan', count: 87 },
          { state: 'Madhya Pradesh', count: 76 }
        ],
        responseTimeData: [
          { time: 'Mon', avgTime: 12 },
          { time: 'Tue', avgTime: 15 },
          { time: 'Wed', avgTime: 11 },
          { time: 'Thu', avgTime: 18 },
          { time: 'Fri', avgTime: 14 },
          { time: 'Sat', avgTime: 16 },
          { time: 'Sun', avgTime: 13 }
        ],
        volunteerActivity: [
          { day: 'Mon', volunteers: 892, helped: 2341 },
          { day: 'Tue', volunteers: 1023, helped: 3456 },
          { day: 'Wed', volunteers: 934, helped: 2890 },
          { day: 'Thu', volunteers: 1156, helped: 4123 },
          { day: 'Fri', volunteers: 1298, helped: 4876 },
          { day: 'Sat', volunteers: 1456, helped: 5634 },
          { day: 'Sun', volunteers: 1234, helped: 4321 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching citizen analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, fetchAnalyticsData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading India analytics...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">India Citizen Analytics</h1>
              <span className="text-sm text-gray-500">Real-time emergency response insights across Indian states</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </span>
              <button 
                onClick={fetchAnalyticsData}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                aria-label="Refresh analytics data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" aria-label="Download analytics report">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label htmlFor="time-range-select" className="text-sm font-medium text-gray-700">Time Range:</label>
                <select
                  id="time-range-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Emergencies</p>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(analyticsData?.overview.totalEmergencies || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Across India</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Volunteers</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(analyticsData?.overview.activeVolunteers || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Helping communities</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Relief Camps</p>
                    <p className="text-2xl font-bold text-orange-600">{analyticsData?.overview.reliefCamps || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Operational across India</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">People Helped</p>
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(analyticsData?.overview.peopleHelped || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Citizens assisted</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emergencies by Type */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Emergencies by Type</h3>
                  <div className="text-sm text-gray-600">
                    India emergency categories
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData?.emergenciesByType || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData?.emergenciesByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Emergencies by State */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Emergencies by State</h3>
                  <div className="text-sm text-gray-600">
                    Top affected Indian states
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analyticsData?.emergenciesByState || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="state"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                      <Tooltip />
                      <RechartsBar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Response Time Trend */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Average Response Time</h3>
                  <div className="text-sm text-gray-600">
                    Minutes to first response
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analyticsData?.responseTimeData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="time" fontSize={12} tick={{ fill: '#6b7280' }} />
                      <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgTime" stroke="#10b981" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Volunteer Activity */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Volunteer Activity</h3>
                  <div className="text-sm text-gray-600">
                    Daily volunteer participation
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart data={analyticsData?.volunteerActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" fontSize={12} tick={{ fill: '#6b7280' }} />
                      <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="volunteers" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                      <Area type="monotone" dataKey="helped" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* India Emergency Hotspots */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">India Emergency Hotspots</h3>
                <div className="text-sm text-gray-600">
                  High-priority areas requiring attention
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-800">Maharashtra</h4>
                      <p className="text-sm text-red-600">234 active emergencies</p>
                      <p className="text-xs text-red-500 mt-1">Flood & Medical emergencies</p>
                    </div>
                    <MapPin className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-orange-800">Uttar Pradesh</h4>
                      <p className="text-sm text-orange-600">198 active emergencies</p>
                      <p className="text-xs text-orange-500 mt-1">Medical & Accident cases</p>
                    </div>
                    <MapPin className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-yellow-800">Bihar</h4>
                      <p className="text-sm text-yellow-600">176 active emergencies</p>
                      <p className="text-xs text-yellow-500 mt-1">Flood response ongoing</p>
                    </div>
                    <MapPin className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CitizenAnalyticsPage;
