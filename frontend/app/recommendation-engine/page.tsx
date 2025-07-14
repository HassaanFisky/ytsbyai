'use client';

import React, { useState } from 'react';
import RecommendationInput from '../../components/recommendation-input';
import RecommendationDisplay from '../../components/recommendation-display';

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

export default function RecommendationEnginePage() {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecommendationsGenerated = (data: RecommendationResponse) => {
    setRecommendations(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GraphRAG Recommendation Engine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered recommendations combining Neo4j graph relationships with Pinecone vector similarity
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Neo4j Graph Search</h3>
              <p className="text-gray-600 text-sm">
                Queries the knowledge graph for topic relationships, user patterns, and semantic connections
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pinecone Vector Search</h3>
              <p className="text-gray-600 text-sm">
                Finds semantically similar content using high-dimensional vector embeddings
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Merging</h3>
              <p className="text-gray-600 text-sm">
                Intelligently combines graph and vector results for optimal recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Hybrid Search</h4>
                <p className="text-gray-600 text-sm">Combines graph relationships with vector similarity</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Personalization</h4>
                <p className="text-gray-600 text-sm">Considers user history and preferences</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Topic Filtering</h4>
                <p className="text-gray-600 text-sm">Filter recommendations by specific topics</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Confidence Scoring</h4>
                <p className="text-gray-600 text-sm">Provides relevance scores and confidence levels</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input and Output */}
        <div className="space-y-8">
          <RecommendationInput
            onRecommendationsGenerated={handleRecommendationsGenerated}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          
          <RecommendationDisplay
            recommendations={recommendations}
            isLoading={isLoading}
          />
        </div>

        {/* Example Queries */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Example Queries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Technology</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "machine learning tutorials"</li>
                <li>• "Python programming basics"</li>
                <li>• "web development frameworks"</li>
                <li>• "data science projects"</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Lifestyle</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "cooking recipes for beginners"</li>
                <li>• "fitness workout routines"</li>
                <li>• "travel vlogs and guides"</li>
                <li>• "personal development tips"</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Entertainment</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "gaming tutorials and reviews"</li>
                <li>• "movie analysis and reviews"</li>
                <li>• "music production tips"</li>
                <li>• "comedy sketches and standup"</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Education</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "history documentaries"</li>
                <li>• "science experiments"</li>
                <li>• "language learning tips"</li>
                <li>• "academic lectures"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 