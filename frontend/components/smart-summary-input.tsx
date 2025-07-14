'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

interface SmartSummaryRequest {
  youtube_url?: string;
  voice_file?: string;
  tone: string;
  max_length: number;
  use_agent: boolean;
  include_similar: boolean;
}

interface SmartSummaryResponse {
  summary: string;
  title: string;
  tone: string;
  video_script?: string;
  cta: string;
  usage_count: number;
  key_points: string[];
  tags: string[];
  similar_summaries: any[];
  vector_id?: string;
}

interface SmartSummaryInputProps {
  onSummaryGenerated: (summary: SmartSummaryResponse) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export default function SmartSummaryInput({ 
  onSummaryGenerated, 
  isLoading = false, 
  setIsLoading 
}: SmartSummaryInputProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tone, setTone] = useState('professional');
  const [maxLength, setMaxLength] = useState(500);
  const [useAgent, setUseAgent] = useState(false);
  const [includeSimilar, setIncludeSimilar] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setError('');
    setIsLoading?.(true);

    try {
      const request: SmartSummaryRequest = {
        youtube_url: youtubeUrl,
        tone,
        max_length: maxLength,
        use_agent: useAgent,
        include_similar: includeSimilar
      };

      const response = await api.post<SmartSummaryResponse>('/api/v1/smart-summary', request);

      if (response.success && response.data) {
        onSummaryGenerated(response.data);
        setYoutubeUrl('');
      } else {
        setError(response.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('An error occurred while generating the summary');
      console.error('Smart summary error:', err);
    } finally {
      setIsLoading?.(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Smart Summary Generator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* YouTube URL Input */}
        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <input
            type="url"
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Tone Selection */}
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
            Summary Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="humorous">Humorous</option>
          </select>
        </div>

        {/* Max Length */}
        <div>
          <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 mb-2">
            Max Summary Length (characters)
          </label>
          <input
            type="number"
            id="maxLength"
            value={maxLength}
            onChange={(e) => setMaxLength(Number(e.target.value))}
            min="100"
            max="2000"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Advanced Options</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useAgent}
                onChange={(e) => setUseAgent(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Use AI Agent (Advanced Processing)</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeSimilar}
                onChange={(e) => setIncludeSimilar(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Include Similar Summaries</span>
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !youtubeUrl.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating Smart Summary...' : 'Generate Smart Summary'}
        </button>
      </form>
    </div>
  );
} 