'use client';

import React, { useState } from 'react';

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

interface SmartSummaryDisplayProps {
  summary: SmartSummaryData;
  onBack?: () => void;
}

export default function SmartSummaryDisplay({ summary, onBack }: SmartSummaryDisplayProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Smart Summary</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Summary Title */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{summary.title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Tone: {summary.tone}</span>
          <span>Usage Count: {summary.usage_count}</span>
          {summary.vector_id && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              Vector Stored
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
            onClick={() => copyToClipboard(summary.summary)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Copy Summary
          </button>
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

      {/* Call to Action */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Call to Action</h4>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-gray-800">{summary.cta}</p>
        </div>
      </div>

      {/* Similar Summaries */}
      {summary.similar_summaries && summary.similar_summaries.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowSimilar(!showSimilar)}
            className="text-lg font-semibold text-gray-800 mb-3 flex items-center"
          >
            Similar Summaries ({summary.similar_summaries.length})
            <span className="ml-2">{showSimilar ? '▼' : '▶'}</span>
          </button>
          {showSimilar && (
            <div className="space-y-3">
              {summary.similar_summaries.map((similar, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-800">
                      {similar.metadata?.video_title || 'Unknown Video'}
                    </h5>
                    <span className="text-sm text-gray-600">
                      {Math.round(similar.score * 100)}% similar
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {similar.metadata?.summary?.substring(0, 150)}...
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {similar.metadata?.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video Script Toggle */}
      {summary.video_script && (
        <div className="mb-6">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-lg font-semibold text-gray-800 mb-3 flex items-center"
          >
            Video Transcript
            <span className="ml-2">{showTranscript ? '▼' : '▶'}</span>
          </button>
          {showTranscript && (
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {summary.video_script}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-4 pt-4 border-t">
        <button
          onClick={() => copyToClipboard(summary.summary)}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Copy Summary
        </button>
        <button
          onClick={() => copyToClipboard(summary.cta)}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Copy CTA
        </button>
        {summary.key_points && summary.key_points.length > 0 && (
          <button
            onClick={() => copyToClipboard(summary.key_points.join('\n'))}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Copy Key Points
          </button>
        )}
      </div>
    </div>
  );
} 