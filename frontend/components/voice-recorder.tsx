'use client';

import React, { useState, useRef, useCallback } from 'react';
import { api } from '../lib/api';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string, summary?: string) => void;
  onError?: (error: string) => void;
  autoSummarize?: boolean;
  language?: string;
}

interface TranscriptionResult {
  transcription: string;
  language: string;
  language_probability: number;
  duration: number;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  summary?: string;
  error?: string;
}

export default function VoiceRecorder({
  onTranscriptionComplete,
  onError,
  autoSummarize = true,
  language
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Failed to start recording. Please check microphone permissions.');
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      if (language) {
        formData.append('language', language);
      }
      
      formData.append('auto_summarize', autoSummarize.toString());
      
      const response = await api.post<TranscriptionResult>('/api/v1/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.success && response.data) {
        const result = response.data;
        
        if (result.error) {
          onError?.(result.error);
        } else {
          onTranscriptionComplete(result.transcription, result.summary);
        }
      } else {
        onError?.('Transcription failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      onError?.('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, language, autoSummarize, onTranscriptionComplete, onError]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Recorder</h3>
      
      {/* Recording Status */}
      <div className="mb-4">
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="font-medium">Recording...</span>
            <span className="text-sm">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Processing...</span>
          </div>
        )}
      </div>
      
      {/* Recording Controls */}
      <div className="flex justify-center space-x-4 mb-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Start Recording</span>
            </div>
          </button>
        )}
        
        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Stop Recording</span>
            </div>
          </button>
        )}
      </div>
      
      {/* Audio Preview */}
      {audioUrl && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recording Preview</h4>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {/* Action Buttons */}
      {audioBlob && !isRecording && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={transcribeAudio}
            disabled={isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>Transcribe & Summarize</span>
            </div>
          </button>
          
          <button
            onClick={resetRecording}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Reset</span>
            </div>
          </button>
        </div>
      )}
      
      {/* Settings */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Auto-summarize</span>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={autoSummarize}
              onChange={(e) => {
                // This would be handled by parent component
                console.log('Auto-summarize:', e.target.checked);
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
        
        {language && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Language</span>
            <span className="text-sm font-medium text-gray-800">{language}</span>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Click "Start Recording" to begin</li>
          <li>• Speak clearly into your microphone</li>
          <li>• Click "Stop Recording" when finished</li>
          <li>• Click "Transcribe & Summarize" to process</li>
        </ul>
      </div>
    </div>
  );
} 