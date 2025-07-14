'use client';

import React from 'react';

interface Recommendation {
  video_id: string;
  title: string;
  reason: string;
  relevance_score: number;
  category: string;
  topic: string;
}

interface RecommendationResponse {
  success: boolean;
  recommendations: Recommendation[];
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

interface RecommendationDisplayProps {
  recommendations: RecommendationResponse | null;
  isLoading?: boolean;
}

export default function RecommendationDisplay({ 
  recommendations, 
  isLoading = false 
}: RecommendationDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  if (!recommendations.success) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{recommendations.error || 'Failed to generate recommendations'}</p>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPersonalizationColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Recommendations</h2>
        <p className="text-gray-600 mb-4">{recommendations.explanation}</p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Analyzed</div>
            <div className="text-lg font-bold text-blue-800">{recommendations.total_videos_analyzed}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Graph Results</div>
            <div className="text-lg font-bold text-green-800">{recommendations.graph_videos}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Vector Results</div>
            <div className="text-lg font-bold text-purple-800">{recommendations.vector_videos}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Confidence</div>
            <div className={`text-lg font-bold ${getConfidenceColor(recommendations.confidence)}`}>
              {(recommendations.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Personalization Level */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPersonalizationColor(recommendations.personalization_level)}`}>
            {recommendations.personalization_level} Personalization
          </span>
        </div>

        {/* Topics */}
        {recommendations.topics.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Related Topics:</h4>
            <div className="flex flex-wrap gap-2">
              {recommendations.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recommendations found for your query.</p>
            <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          recommendations.recommendations.map((rec, index) => (
            <div
              key={rec.video_id || index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex-1">
                  {rec.title}
                </h3>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm text-gray-500">
                    Score: {(rec.relevance_score * 100).toFixed(1)}%
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    rec.relevance_score >= 0.8 ? 'bg-green-500' :
                    rec.relevance_score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </div>

              <p className="text-gray-600 mb-3">{rec.reason}</p>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {rec.category}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {rec.topic}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  {rec.video_id}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* GraphRAG Architecture Info */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-2">GraphRAG Architecture</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-purple-700 mb-1">Neo4j Graph</h5>
            <p className="text-purple-600">Topic relationships, user patterns, and semantic connections</p>
          </div>
          <div>
            <h5 className="font-medium text-blue-700 mb-1">Pinecone Vectors</h5>
            <p className="text-blue-600">Semantic similarity search using embeddings</p>
          </div>
          <div>
            <h5 className="font-medium text-green-700 mb-1">AI Merging</h5>
            <p className="text-green-600">Intelligent combination of graph and vector results</p>
          </div>
        </div>
      </div>
    </div>
  );
} 