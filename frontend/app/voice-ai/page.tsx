'use client';

import React, { useState } from 'react';
import VoiceRecorder from '../../components/voice-recorder';
import VoicePlayer from '../../components/voice-player';

interface TranscriptionResult {
  transcription: string;
  summary?: string;
}

export default function VoiceAIPage() {
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoPlaySummary, setAutoPlaySummary] = useState(true);

  const handleTranscriptionComplete = (transcription: string, summary?: string) => {
    setTranscriptionResult({ transcription, summary });
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Voice AI Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time voice transcription and AI-powered speech synthesis with automatic summarization
          </p>
        </div>

        {/* Features Overview */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Voice AI Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Voice Transcription</h3>
              <p className="text-gray-600 text-sm">
                Record audio and get accurate transcriptions using OpenAI Whisper
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Summarization</h3>
              <p className="text-gray-600 text-sm">
                Automatic summarization using LangGraph workflow and Neo4j
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Speech Synthesis</h3>
              <p className="text-gray-600 text-sm">
                Natural voice synthesis with multiple voices and speed control
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Recorder */}
          <div>
            <VoiceRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
              onError={handleError}
              autoSummarize={true}
            />
          </div>

          {/* Results Display */}
          <div>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {transcriptionResult && (
              <div className="space-y-4">
                {/* Transcription */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcription</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {transcriptionResult.transcription}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                {transcriptionResult.summary && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Summary</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-700 whitespace-pre-wrap">
                        {transcriptionResult.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Voice Player */}
                {(transcriptionResult.summary || transcriptionResult.transcription) && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Listen to Summary</h3>
                    <VoicePlayer
                      text={transcriptionResult.summary || transcriptionResult.transcription}
                      autoPlay={autoPlaySummary}
                      onError={handleError}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Auto-play Summary</h4>
                <p className="text-sm text-gray-500">Automatically play summary audio when available</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoPlaySummary}
                  onChange={(e) => setAutoPlaySummary(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Voice Transcription Process</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Record audio using your microphone</li>
                <li>2. Audio is processed with OpenAI Whisper</li>
                <li>3. Transcription is sent to LangGraph workflow</li>
                <li>4. AI generates summary and stores in Neo4j</li>
                <li>5. Results are displayed with voice synthesis option</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Voice Synthesis Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multiple voice options available</li>
                <li>• Adjustable playback speed (0.5x - 2.0x)</li>
                <li>• Auto-play functionality</li>
                <li>• High-quality audio output</li>
                <li>• Voice cloning capabilities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Technical Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Backend</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• FastAPI with WebSocket support</li>
                <li>• OpenAI Whisper (faster-whisper)</li>
                <li>• OpenVoice for speech synthesis</li>
                <li>• LangGraph workflow integration</li>
                <li>• Neo4j for data storage</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Frontend</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React with TypeScript</li>
                <li>• MediaRecorder API</li>
                <li>• WebSocket for real-time</li>
                <li>• Audio playback controls</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Infrastructure</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Docker containerization</li>
                <li>• GPU support for AI models</li>
                <li>• Rate limiting & authentication</li>
                <li>• Usage tracking & billing</li>
                <li>• Production deployment ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 