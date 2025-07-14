'use client';

import React, { useState } from 'react';
import LangGraphSummaryInput from '../../components/langgraph-summary-input';
import LangGraphSummaryDisplay from '../../components/langgraph-summary-display';

interface LangGraphSummaryData {
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

export default function LangGraphWorkflowPage() {
  const [currentSummary, setCurrentSummary] = useState<LangGraphSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummaryGenerated = (summary: LangGraphSummaryData) => {
    setCurrentSummary(summary);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LangGraph Workflow Automation
          </h1>
          <p className="text-lg text-gray-600">
            Advanced AI pipeline with summarization, classification, and dual storage
          </p>
        </div>

        {/* Content */}
        <div>
          {!currentSummary ? (
            <LangGraphSummaryInput
              onSummaryGenerated={handleSummaryGenerated}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <LangGraphSummaryDisplay
              summary={currentSummary}
              onBack={() => setCurrentSummary(null)}
            />
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-purple-600 text-2xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">LangGraph Pipeline</h3>
            <p className="text-gray-600">
              Orchestrated workflow with summarization, classification, and intelligent routing.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-blue-600 text-2xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Dual Storage</h3>
            <p className="text-gray-600">
              Pinecone for vector similarity search and Neo4j for graph relationship analysis.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-green-600 text-2xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Smart Classification</h3>
            <p className="text-gray-600">
              AI-powered topic classification with confidence scores and subcategories.
            </p>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="mt-16 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Workflow Architecture</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-wrap justify-center items-center space-x-4 text-sm">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded">YouTube URL</div>
              <div className="text-gray-500">→</div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded">Summarize</div>
              <div className="text-gray-500">→</div>
              <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded">Classify</div>
              <div className="text-gray-500">→</div>
              <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded">Pinecone Store</div>
              <div className="text-gray-500">→</div>
              <div className="bg-red-100 text-red-800 px-3 py-2 rounded">Neo4j Store</div>
              <div className="text-gray-500">→</div>
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded">Finalize</div>
            </div>
          </div>
        </div>

        {/* API Endpoints Info */}
        <div className="mt-16 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Available API Endpoints</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">LangGraph Workflow</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• POST /api/v1/langgraph-summary - Run workflow</li>
                <li>• GET /api/v1/workflow-status/{'{thread_id}'} - Get status</li>
                <li>• GET /api/v1/workflow-threads - List threads</li>
                <li>• DELETE /api/v1/workflow-thread/{'{thread_id}'} - Clear thread</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Neo4j Graph</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• GET /api/v1/neo4j/user-summaries - User summaries</li>
                <li>• GET /api/v1/neo4j/topic-search/{'{topic}'} - Topic search</li>
                <li>• GET /api/v1/neo4j/statistics - Graph stats</li>
                <li>• DELETE /api/v1/neo4j/summary/{'{video_id}'} - Delete summary</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-16 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Technical Implementation</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">LangGraph Features</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• State management with WorkflowState</li>
                <li>• Conditional edges for error handling</li>
                <li>• Memory checkpointing for resumability</li>
                <li>• Modular node architecture</li>
                <li>• Async/await throughout pipeline</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Storage Features</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Pinecone vector similarity search</li>
                <li>• Neo4j graph relationship analysis</li>
                <li>• Automatic constraint creation</li>
                <li>• Rich metadata storage</li>
                <li>• User-specific filtering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 