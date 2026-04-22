import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* ResQ Hub Info */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/logo.png"
                alt="ResQ Hub Logo"
                className="w-10 h-10 rounded-lg mr-3"
              />
              <div>
                <h3 className="text-xl font-bold text-white">ResQ Hub</h3>
                <p className="text-xs text-gray-400">National Disaster Management Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Production-ready emergency response system with real-time flood monitoring, 
              relief coordination, and volunteer management for India.
            </p>
          </div>

          {/* Development Team */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Development Team</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-gray-200">Saumyaranjan Nayak</p>
                <p className="text-xs text-gray-400">Lead Software Engineer</p>
              </div>
              <div>
                <p className="font-medium text-gray-200">Shubham Mohite</p>
                <p className="text-xs text-gray-400">Web Dashboard Development</p>
              </div>
              <div>
                <p className="font-medium text-gray-200">Shreyash Singh</p>
                <p className="text-xs text-gray-400">Web Dashboard Development</p>
              </div>
              <div>
                <p className="font-medium text-gray-200">Aditya Singh</p>
                <p className="text-xs text-gray-400">Web Dashboard Development</p>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
