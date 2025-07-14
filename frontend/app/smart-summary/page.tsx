'use client';

import React, { useState } from 'react';
import SmartSummaryInput from '../../components/smart-summary-input';
import SmartSummaryDisplay from '../../components/smart-summary-display';
import SummarySearch from '../../components/summary-search';

interface SmartSummaryData {
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

export default function SmartSummaryPage() {
  const [currentSummary, setCurrentSummary] = useState<SmartSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'search'>('generate');

  const handleSummaryGenerated = (summary: SmartSummaryData) => {
    setCurrentSummary(summary);
  };

  const handleSearchResultClick = (result: any) => {
    // Convert search result to summary format
    const summary: SmartSummaryData = {
      summary: result.metadata.summary,
      title: result.metadata.video_title,
      tone: result.metadata.tone,
      cta: "Check out this summary!",
      usage_count: 0,
      key_points: result.metadata.key_points || [],
      tags: result.metadata.tags || [],
      similar_summaries: [],
      vector_id: result.id
    };
    setCurrentSummary(summary);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Summary with LangChain & Pinecone
          </h1>
          <p className="text-lg text-gray-600">
            Advanced AI-powered YouTube summarization with vector storage and semantic search
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow p-1">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'generate'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Generate Summary
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Search Summaries
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'generate' ? (
          <div>
            {!currentSummary ? (
              <SmartSummaryInput
                onSummaryGenerated={handleSummaryGenerated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : (
              <SmartSummaryDisplay
                summary={currentSummary}
                onBack={() => setCurrentSummary(null)}
              />
            )}
          </div>
        ) : (
          <SummarySearch onResultClick={handleSearchResultClick} />
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-blue-600 text-2xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">LangChain Integration</h3>
            <p className="text-gray-600">
              Advanced AI chains and agents for intelligent summarization with memory and context awareness.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-green-600 text-2xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Pinecone Vector Storage</h3>
            <p className="text-gray-600">
              Semantic vector storage for intelligent search and similarity matching across all summaries.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-purple-600 text-2xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
            <p className="text-gray-600">
              Find similar content and discover patterns across your video summaries with semantic search.
            </p>
          </div>
        </div>

        {/* API Endpoints Info */}
        <div className="mt-16 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Available API Endpoints</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Smart Summary</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• POST /api/v1/smart-summary - Generate smart summary</li>
                <li>• POST /api/v1/search-summaries - Search summaries</li>
                <li>• GET /api/v1/user-summaries - Get user summaries</li>
                <li>• DELETE /api/v1/summary/{'{vector_id}'} - Delete summary</li>
                <li>• GET /api/v1/summary-stats - Get statistics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• AI Agent processing</li>
                <li>• Vector similarity search</li>
                <li>• Key points extraction</li>
                <li>• Automatic tagging</li>
                <li>• Usage tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 