'use client';

import { useState } from 'react';
import { api, ApiResponse } from '@/lib/api';

interface SummaryData {
  id: string;
  text: string;
  summary: string;
  created_at: string;
}

export default function ApiExample() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse<SummaryData> | null>(null);
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Example API call using our professional utility
      const response = await api.post<SummaryData>('/api/v1/summary', {
        text: text,
        type: 'youtube'
      });
      
      setResult(response);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        error: 'Failed to create summary'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetSummary = async (id: string) => {
    setLoading(true);
    
    try {
      const response = await api.get<SummaryData>(`/api/v1/summary/${id}`);
      setResult(response);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        error: 'Failed to fetch summary'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Professional API Example</h2>
      
      {/* Create Summary Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Enter text to summarize:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={4}
            placeholder="Enter your text here..."
          />
        </div>
        <button
          type="submit"
          disabled={loading || !text}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? 'Creating Summary...' : 'Create Summary'}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className={`p-4 rounded-md ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className="font-semibold mb-2">
            {result.success ? '✅ Success' : '❌ Error'}
          </h3>
          {result.success && result.data ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {result.data.id}</p>
              <p><strong>Summary:</strong> {result.data.summary}</p>
              <p><strong>Created:</strong> {new Date(result.data.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-600">{result.error}</p>
          )}
        </div>
      )}

      {/* Test Get Summary */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Test Get Summary</h3>
        <button
          onClick={() => handleGetSummary('test-id')}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? 'Fetching...' : 'Get Summary (test-id)'}
        </button>
      </div>

      {/* API Status */}
      <div className="text-sm text-gray-600">
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
        <p><strong>Status:</strong> {loading ? 'Loading...' : 'Ready'}</p>
      </div>
    </div>
  );
} 