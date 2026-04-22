import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, AlertTriangle, MapPin, BarChart3, ArrowRight, Smartphone } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUserPanel = () => {
    navigate('/citizen');
  };

  const handleAdminPanel = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="ResQ Hub Logo"
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg"
                />
              </div>
              <div className="text-gray-900">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  ResQ Hub
                </h1>
                <p className="text-sm lg:text-base text-gray-600 font-medium">
                  India Disaster Response Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Welcome to ResQ Hub
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Choose your access panel to continue with India's comprehensive disaster management system
            </p>

            {/* Panel Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* User Panel Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    User Panel
                  </h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Access citizen services, report emergencies, track relief efforts, and get real-time updates
                  </p>
                  <button
                    onClick={handleUserPanel}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 group"
                  >
                    <span>Enter User Panel</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Admin Panel Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Admin Panel
                  </h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Manage disasters, coordinate response teams, access analytics, and oversee operations
                  </p>
                  <button
                    onClick={handleAdminPanel}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 group"
                  >
                    <span>Enter Admin Panel</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Citizen Services</h4>
                <p className="text-sm text-gray-600">SOS, Reports, Relief Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Real-time Maps</h4>
                <p className="text-sm text-gray-600">Live Disaster Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics</h4>
                <p className="text-sm text-gray-600">India-wide Insights</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-12 bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Emergency Hotline</h4>
                  <p className="text-red-700">National Disaster Response: 1127 (India)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
