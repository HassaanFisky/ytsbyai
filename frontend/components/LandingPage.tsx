"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Youtube, Mic, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md">
        Skip to content
      </a>

      <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              YTS by AI
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Transform any YouTube video or voice input into engaging, AI-powered summaries using GPT-4 and Whisper
            </motion.p>
            
            {/* Feature Pills */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">YouTube Videos</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <Mic className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Voice Input</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">AI Summaries</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link 
                href="/app"
                className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:scale-105 focus:outline-none focus-visible:ring-2 ring-blue-500 transition-transform"
              >
                Try It Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/how-it-works"
                className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 ring-blue-500 transition-colors"
              >
                How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            className="mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
              Why Choose YTS by AI?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">YouTube Integration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Works with any YouTube video, including unlisted and low-view content
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  GPT-4 summaries with Whisper fallback for accurate transcript extraction
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Voice Input</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Summarize your own voice recordings and audio content
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
} 