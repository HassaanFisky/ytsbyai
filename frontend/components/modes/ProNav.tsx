'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Mic, Sparkles, Settings, BarChart3, Clock, User, LogOut } from 'lucide-react';

export default function ProNav() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <motion.header 
      className="bg-white border-b border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-xl font-semibold text-gray-900">
              YTS by AI
            </div>
            <div className="text-sm text-gray-500">Professional Suite</div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <motion.button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'videos' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Youtube className="w-4 h-4" />
              <span>Videos</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'voice' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mic className="w-4 h-4" />
              <span>Voice</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'ai' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Tools</span>
            </motion.button>
          </nav>

          {/* Professional Actions */}
          <div className="flex items-center space-x-4">
            {/* Time Tracking */}
            <motion.div
              className="flex items-center space-x-2 text-sm text-gray-600"
              whileHover={{ scale: 1.02 }}
            >
              <Clock className="w-4 h-4" />
              <span>2h 34m</span>
            </motion.div>

            {/* Settings */}
            <motion.button
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* User Profile */}
            <motion.button
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">John Doe</span>
            </motion.button>

            {/* Logout */}
            <motion.button
              className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 