'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

interface LangGraphSummaryRequest {
  youtube_url: string;
  tone: string;
  use_checkpointing: boolean;
  thread_id?: string;
}

interface LangGraphSummaryResponse {
  success: boolean;
  video_id: string;
  summary?: string;
  title?: string;
  topic?: string;
  category?: string;
  confidence?: number;
  key_points: string[];
  tags: string[];
  pinecone_id?: string;
  neo4j_id?: string;
  thread_id?: string;
  error?: string;
  error_step?: string;
  processing_time?: number;
}

interface LangGraphSummaryInputProps {
  onSummaryGenerated: (summary: LangGraphSummaryResponse) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export default function LangGraphSummaryInput({ 
  onSummaryGenerated, 
  isLoading = false, 
  setIsLoading 
}: LangGraphSummaryInputProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tone, setTone] = useState('professional');
  const [useCheckpointing, setUseCheckpointing] = useState(false);
  const [threadId, setThreadId] = useState('');
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
      const request: LangGraphSummaryRequest = {
        youtube_url: youtubeUrl,
        tone,
        use_checkpointing: useCheckpointing,
        thread_id: threadId || undefined
      };

      const response = await api.post<LangGraphSummaryResponse>('/api/v1/langgraph-summary', request);

      if (response.success && response.data) {
        onSummaryGenerated(response.data);
        setYoutubeUrl('');
        setThreadId('');
      } else {
        setError(response.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('An error occurred while generating the summary');
      console.error('LangGraph summary error:', err);
    } finally {
      setIsLoading?.(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">LangGraph Workflow Summary</h2>
      <p className="text-sm text-gray-600 mb-6">
        Advanced AI workflow with summarization, classification, and dual storage (Pinecone + Neo4j)
      </p>
      
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

        {/* Advanced Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Workflow Options</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useCheckpointing}
                onChange={(e) => setUseCheckpointing(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Use Checkpointing (Resumable Workflow)</span>
            </label>
          </div>

          {useCheckpointing && (
            <div>
              <label htmlFor="threadId" className="block text-sm font-medium text-gray-700 mb-2">
                Thread ID (Optional - for resuming workflow)
              </label>
              <input
                type="text"
                id="threadId"
                value={threadId}
                onChange={(e) => setThreadId(e.target.value)}
                placeholder="workflow_video_id"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        {/* Workflow Steps Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Workflow Steps:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. <strong>Summarize:</strong> Generate comprehensive summary with key points</li>
            <li>2. <strong>Classify:</strong> AI-powered topic and category classification</li>
            <li>3. <strong>Pinecone Store:</strong> Vector storage for semantic search</li>
            <li>4. <strong>Neo4j Store:</strong> Graph storage for relationship analysis</li>
            <li>5. <strong>Finalize:</strong> Complete workflow with metadata</li>
          </ol>
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
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Running LangGraph Workflow...' : 'Run LangGraph Workflow'}
        </button>
      </form>
    </div>
  );
} 