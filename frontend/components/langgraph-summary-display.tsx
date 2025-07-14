'use client';

import React, { useState } from 'react';

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

interface LangGraphSummaryDisplayProps {
  summary: LangGraphSummaryData;
  onBack?: () => void;
}

export default function LangGraphSummaryDisplay({ summary, onBack }: LangGraphSummaryDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!summary.success) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Workflow Failed</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Details</h3>
          <p className="text-red-700 mb-2"><strong>Error:</strong> {summary.error}</p>
          <p className="text-red-700"><strong>Failed Step:</strong> {summary.error_step}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">LangGraph Workflow Results</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Success Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="text-green-600 text-xl mr-2">✅</div>
          <div>
            <h3 className="font-semibold text-green-800">Workflow Completed Successfully</h3>
            <p className="text-green-700 text-sm">
              Video ID: {summary.video_id} | Processing Time: {summary.processing_time?.toFixed(2)}s
            </p>
          </div>
        </div>
      </div>

      {/* Summary Title */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{summary.title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Video ID: {summary.video_id}</span>
          {summary.thread_id && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              Thread: {summary.thread_id}
            </span>
          )}
        </div>
      </div>

      {/* Main Summary */}
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800 leading-relaxed">{summary.summary}</p>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => copyToClipboard(summary.summary || '')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Copy Summary
          </button>
        </div>
      </div>

      {/* Classification Results */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">AI Classification</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">Topic & Category</h5>
            <p className="text-blue-700"><strong>Topic:</strong> {summary.topic}</p>
            <p className="text-blue-700"><strong>Category:</strong> {summary.category}</p>
            <p className="text-blue-700"><strong>Confidence:</strong> {(summary.confidence || 0) * 100}%</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-purple-800 mb-2">Storage IDs</h5>
            <p className="text-purple-700"><strong>Pinecone:</strong> {summary.pinecone_id || 'N/A'}</p>
            <p className="text-purple-700"><strong>Neo4j:</strong> {summary.neo4j_id || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Key Points */}
      {summary.key_points && summary.key_points.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Key Points</h4>
          <ul className="list-disc list-inside space-y-2">
            {summary.key_points.map((point, index) => (
              <li key={index} className="text-gray-700">{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {summary.tags && summary.tags.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {summary.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Details Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-lg font-semibold text-gray-800 mb-3 flex items-center"
        >
          Workflow Details
          <span className="ml-2">{showDetails ? '▼' : '▶'}</span>
        </button>
        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Processing Information</h5>
                <p><strong>Processing Time:</strong> {summary.processing_time?.toFixed(2)}s</p>
                <p><strong>Thread ID:</strong> {summary.thread_id || 'N/A'}</p>
                <p><strong>Video ID:</strong> {summary.video_id}</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Storage Information</h5>
                <p><strong>Pinecone Vector ID:</strong> {summary.pinecone_id || 'N/A'}</p>
                <p><strong>Neo4j Graph ID:</strong> {summary.neo4j_id || 'N/A'}</p>
                <p><strong>Confidence Score:</strong> {(summary.confidence || 0) * 100}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-4 pt-4 border-t">
        <button
          onClick={() => copyToClipboard(summary.summary || '')}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Copy Summary
        </button>
        <button
          onClick={() => copyToClipboard(summary.key_points.join('\n'))}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Copy Key Points
        </button>
        <button
          onClick={() => copyToClipboard(summary.tags.join(', '))}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Copy Tags
        </button>
      </div>
    </div>
  );
} 