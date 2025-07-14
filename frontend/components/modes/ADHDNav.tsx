'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Mic, Sparkles, Focus, Timer, Eye, Volume2, VolumeX } from 'lucide-react';

export default function ADHDNav() {
  const [activeTab, setActiveTab] = useState('videos');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <motion.header 
      className="bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg border-b-4 border-orange-600"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section - High Contrast */}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold bg-white text-orange-600 px-4 py-2 rounded-lg shadow-lg">
              YTS by AI
            </div>
            <div className="text-lg font-semibold">🎯 Focus Mode</div>
          </motion.div>

          {/* Simplified Navigation - Large Buttons */}
          <nav className="hidden md:flex items-center space-x-4">
            <motion.button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-lg font-semibold transition-all ${
                activeTab === 'videos' 
                  ? 'bg-white text-orange-600 shadow-lg border-2 border-white' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-transparent'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Youtube className="w-6 h-6" />
              <span>VIDEOS</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-lg font-semibold transition-all ${
                activeTab === 'voice' 
                  ? 'bg-white text-orange-600 shadow-lg border-2 border-white' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-transparent'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-6 h-6" />
              <span>VOICE</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-lg font-semibold transition-all ${
                activeTab === 'ai' 
                  ? 'bg-white text-orange-600 shadow-lg border-2 border-white' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-transparent'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-6 h-6" />
              <span>AI</span>
            </motion.button>
          </nav>

          {/* Accessibility Controls */}
          <div className="flex items-center space-x-4">
            {/* Focus Mode Toggle */}
            <motion.button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                focusMode 
                  ? 'bg-green-600 text-white border-2 border-green-400' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-transparent'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Focus className="w-5 h-5" />
              <span>{focusMode ? 'FOCUS ON' : 'FOCUS OFF'}</span>
            </motion.button>

            {/* Timer */}
            <motion.div
              className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg border-2 border-white"
              whileHover={{ scale: 1.02 }}
            >
              <Timer className="w-5 h-5" />
              <span className="font-bold text-lg">25:00</span>
            </motion.div>

            {/* Sound Toggle */}
            <motion.button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg border-2 border-white hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              <span className="font-semibold">{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span>
            </motion.button>

            {/* High Contrast Toggle */}
            <motion.button
              className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg border-2 border-white hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-5 h-5" />
              <span className="font-semibold">HIGH CONTRAST</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 