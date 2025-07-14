'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { formatDate } from '@/lib/utils';

interface SearchResult {
  id: string;
  score: number;
  metadata: {
    video_title: string;
    summary: string;
    tone: string;
    tags: string[];
    key_points: string[];
    created_at: string;
  };
}

interface SearchResponse {
  results: SearchResult[];
  total_found: number;
}

interface SummarySearchProps {
  onResultClick?: (result: SearchResult) => void;
}

export default function SummarySearch({ onResultClick }: SummarySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post<SearchResponse>('/api/v1/search-summaries', {
        query: query.trim(),
        top_k: 10
      });

      if (response.success && response.data) {
        setResults(response.data.results);
        setHasSearched(true);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Search Summaries</h2>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for summaries by topic, content, or keywords..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {results.length > 0 
                ? `Found ${results.length} result${results.length !== 1 ? 's' : ''}`
                : 'No results found'
              }
            </h3>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onResultClick?.(result)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {result.metadata.video_title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {Math.round(result.score * 100)}% match
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(result.metadata.created_at)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-3">
                    {result.metadata.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Tone: {result.metadata.tone}
                      </span>
                      {result.metadata.tags && result.metadata.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {result.metadata.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Copy summary to clipboard
                        navigator.clipboard.writeText(result.metadata.summary);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>

                  {result.metadata.key_points && result.metadata.key_points.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Key Points:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {result.metadata.key_points.slice(0, 3).map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && results.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No summaries found matching your search.</p>
          <p className="text-sm text-gray-400 mt-2">
            Try different keywords or check your spelling.
          </p>
        </div>
      )}
    </div>
  );
} 