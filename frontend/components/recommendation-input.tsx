'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

interface RecommendationRequest {
  query: string;
  limit: number;
  include_user_history: boolean;
  filter_by_topic?: string;
}

interface RecommendationResponse {
  success: boolean;
  recommendations: Array<{
    video_id: string;
    title: string;
    reason: string;
    relevance_score: number;
    category: string;
    topic: string;
  }>;
  explanation: string;
  topics: string[];
  confidence: number;
  total_videos_analyzed: number;
  graph_videos: number;
  vector_videos: number;
  personalization_level: string;
  user_id?: string;
  error?: string;
}

interface RecommendationInputProps {
  onRecommendationsGenerated: (recommendations: RecommendationResponse) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export default function RecommendationInput({ 
  onRecommendationsGenerated, 
  isLoading = false, 
  setIsLoading 
}: RecommendationInputProps) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [includeUserHistory, setIncludeUserHistory] = useState(true);
  const [filterByTopic, setFilterByTopic] = useState('');
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [error, setError] = useState('');

  const fetchAvailableTopics = async () => {
    try {
      const response = await api.get('/api/v1/recommend/topics');
      if (response.success && response.data) {
        setAvailableTopics(response.data.topics || []);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
    }
  };

  React.useEffect(() => {
    fetchAvailableTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setError('');
    setIsLoading?.(true);

    try {
      const request: RecommendationRequest = {
        query: query.trim(),
        limit,
        include_user_history: includeUserHistory,
        filter_by_topic: filterByTopic || undefined
      };

      const response = await api.post<RecommendationResponse>('/api/v1/recommend', request);

      if (response.success && response.data) {
        onRecommendationsGenerated(response.data);
        setQuery('');
      } else {
        setError(response.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      setError('An error occurred while generating recommendations');
      console.error('Recommendation error:', err);
    } finally {
      setIsLoading?.(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">GraphRAG Recommendation Engine</h2>
      <p className="text-sm text-gray-600 mb-6">
        AI-powered recommendations combining Neo4j graph relationships with Pinecone vector similarity
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Query */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            Search Query
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., machine learning tutorials, cooking videos, gaming content..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Number of Results */}
        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Recommendations
          </label>
          <input
            type="number"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min="1"
            max="50"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Topic Filter */}
        <div>
          <label htmlFor="filterByTopic" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Topic (Optional)
          </label>
          <select
            id="filterByTopic"
            value={filterByTopic}
            onChange={(e) => setFilterByTopic(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">All Topics</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* User History Option */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeUserHistory}
              onChange={(e) => setIncludeUserHistory(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">Include User History for Personalization</span>
          </label>
        </div>

        {/* GraphRAG Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">How GraphRAG Works:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Graph Search:</strong> Queries Neo4j for topic relationships and user patterns</li>
            <li>• <strong>Vector Search:</strong> Finds similar content using Pinecone embeddings</li>
            <li>• <strong>AI Merging:</strong> Intelligently combines both results for optimal recommendations</li>
            <li>• <strong>Personalization:</strong> Considers user history and preferences</li>
          </ul>
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
          disabled={isLoading || !query.trim()}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating Recommendations...' : 'Get Recommendations'}
        </button>
      </form>
    </div>
  );
} 