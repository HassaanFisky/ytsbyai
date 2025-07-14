'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Mic, Sparkles, Heart, Share2, MessageCircle, Bell } from 'lucide-react';

export default function TeenHeader() {
  const [liked, setLiked] = useState(false);
  const [notifications, setNotifications] = useState(3);

  return (
    <motion.header 
      className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold bg-white/20 px-3 py-1 rounded-full">
              YTS by AI
            </div>
            <div className="text-sm opacity-90">✨ Your AI Bestie</div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <motion.a 
              href="#" 
              className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Youtube className="w-5 h-5" />
              <span>Videos</span>
            </motion.a>
            
            <motion.a 
              href="#" 
              className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-5 h-5" />
              <span>Voice</span>
            </motion.a>
            
            <motion.a 
              href="#" 
              className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              <span>AI Magic</span>
            </motion.a>
          </nav>

          {/* Social Actions */}
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <motion.button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-full transition-colors ${
                liked ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Share Button */}
            <motion.button
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>

            {/* Messages */}
            <motion.button
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </motion.button>

            {/* Notifications */}
            <motion.button
              onClick={() => setNotifications(0)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 