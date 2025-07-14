'use client';

import React, { useState, useRef, useCallback } from 'react';
import { api } from '../lib/api';

interface VoicePlayerProps {
  text: string;
  voiceId?: string;
  speed?: number;
  autoPlay?: boolean;
  onError?: (error: string) => void;
}

interface SynthesisResult {
  audio_base64: string;
  duration: number;
  voice_id: string;
  text_length: number;
  error?: string;
}

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  requires_cloning?: boolean;
}

export default function VoicePlayer({
  text,
  voiceId = "default",
  speed = 1.0,
  autoPlay = false,
  onError
}: VoicePlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(voiceId);
  const [selectedSpeed, setSelectedSpeed] = useState(speed);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load available voices on mount
  React.useEffect(() => {
    loadAvailableVoices();
  }, []);

  // Auto-play if enabled
  React.useEffect(() => {
    if (autoPlay && text && !isLoading && !audioUrl) {
      synthesizeAndPlay();
    }
  }, [autoPlay, text, isLoading, audioUrl]);

  const loadAvailableVoices = async () => {
    try {
      const response = await api.get('/api/v1/voices');
      if (response.success && response.data) {
        setAvailableVoices(response.data.voices || []);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const synthesizeAndPlay = useCallback(async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await api.post<SynthesisResult>('/api/v1/synthesize', {
        text: text.trim(),
        voice_id: selectedVoice,
        speed: selectedSpeed
      });
      
      if (response.success && response.data) {
        const result = response.data;
        
        if (result.error) {
          onError?.(result.error);
          return;
        }
        
        // Convert base64 to audio URL
        const audioData = atob(result.audio_base64);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        
        const blob = new Blob([audioArray], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Play audio
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.playbackRate = selectedSpeed;
          audioRef.current.play();
          setIsPlaying(true);
        }
        
      } else {
        onError?.('Failed to synthesize speech. Please try again.');
      }
      
    } catch (error) {
      console.error('Synthesis error:', error);
      onError?.('Failed to synthesize speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, selectedSpeed, onError]);

  const handlePlay = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      synthesizeAndPlay();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSelectedSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleVoiceChange = (newVoiceId: string) => {
    setSelectedVoice(newVoiceId);
    // Re-synthesize with new voice
    if (audioUrl) {
      setAudioUrl(null);
      synthesizeAndPlay();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Player</h3>
      
      {/* Voice Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voice
        </label>
        <select
          value={selectedVoice}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {availableVoices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} ({voice.language})
            </option>
          ))}
        </select>
      </div>
      
      {/* Speed Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Speed: {selectedSpeed}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={selectedSpeed}
          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.5x</span>
          <span>1.0x</span>
          <span>2.0x</span>
        </div>
      </div>
      
      {/* Audio Controls */}
      <div className="mb-4">
        <div className="flex justify-center space-x-4">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{isLoading ? 'Synthesizing...' : 'Play'}</span>
              </div>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Pause</span>
              </div>
            </button>
          )}
          
          <button
            onClick={handleStop}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Stop</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          onError?.('Error playing audio');
        }}
        className="w-full"
        controls
      />
      
      {/* Text Preview */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Text to Speak</h4>
        <p className="text-sm text-gray-600 line-clamp-3">
          {text || 'No text provided'}
        </p>
      </div>
      
      {/* Auto-play Toggle */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">Auto-play on load</span>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => {
              // This would be handled by parent component
              console.log('Auto-play:', e.target.checked);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <h4 className="text-sm font-medium text-green-800 mb-1">Voice Features</h4>
        <ul className="text-xs text-green-700 space-y-1">
          <li>• Select different voices for variety</li>
          <li>• Adjust playback speed (0.5x - 2.0x)</li>
          <li>• Auto-play option for summaries</li>
          <li>• High-quality speech synthesis</li>
        </ul>
      </div>
    </div>
  );
} 