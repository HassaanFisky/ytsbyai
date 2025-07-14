'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Sparkles, 
  Zap, 
  Users, 
  Crown,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaInfo: {
    service: 'summary' | 'transcription';
    used: number;
    limit: number;
    remaining: number;
  };
  onContinueFree: () => void;
  onUnlockPro: () => void;
}

const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({
  isOpen,
  onClose,
  quotaInfo,
  onContinueFree,
  onUnlockPro
}) => {
  const [progressValue, setProgressValue] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);

  // Animate progress bar filling
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setProgressValue((quotaInfo.used / quotaInfo.limit) * 100);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, quotaInfo]);

  // Show features after progress animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowFeatures(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowFeatures(false);
    }
  }, [isOpen]);

  const handleContinueFree = () => {
    onContinueFree();
    onClose();
  };

  const handleUnlockPro = () => {
    onUnlockPro();
    onClose();
  };

  const getServiceIcon = () => {
    return quotaInfo.service === 'summary' ? <Sparkles className="h-5 w-5" /> : <Zap className="h-5 w-5" />;
  };

  const getServiceName = () => {
    return quotaInfo.service === 'summary' ? 'YouTube Summaries' : 'Voice Transcriptions';
  };

  const getServiceDescription = () => {
    return quotaInfo.service === 'summary' 
      ? 'AI-powered video summaries with smart insights'
      : 'Real-time voice transcription with AI analysis';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="relative overflow-hidden">
              {/* Header */}
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                    >
                      <Star className="h-3 w-3 text-yellow-800" />
                    </motion.div>
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-900">
                  You've Reached the Free Limit!
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Continue with unlimited access to all features
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Progress Animation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {getServiceIcon()}
                      {getServiceName()}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {quotaInfo.used}/{quotaInfo.limit} Used
                    </Badge>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={progressValue} 
                      className="h-3 bg-gray-200"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressValue}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    {getServiceDescription()}
                  </p>
                </div>

                {/* Features List */}
                <AnimatePresence>
                  {showFeatures && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        Pro Features Include:
                      </h4>
                      
                      <div className="space-y-2">
                        {[
                          'Unlimited YouTube summaries',
                          'Unlimited voice transcriptions',
                          'Advanced AI analysis',
                          'Priority processing',
                          'Export & sharing tools',
                          'Custom voice cloning',
                          'LangGraph workflows',
                          'GraphRAG recommendations'
                        ].map((feature, index) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleUnlockPro}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Unlock Pro Features
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <Button
                    onClick={handleContinueFree}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Continue for Free
                  </Button>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuotaExceededModal; 