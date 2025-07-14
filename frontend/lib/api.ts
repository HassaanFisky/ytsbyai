// Professional API utility for frontend-backend communication
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export async function fetchFromAPI<T = any>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      credentials: 'include', // for cookies/auth
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return { data, success: true };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      success: false 
    };
  }
}

// Convenience methods for common HTTP operations
export const api = {
  get: <T = any>(endpoint: string) => 
    fetchFromAPI<T>(endpoint, { method: 'GET' }),
  
  post: <T = any>(endpoint: string, data?: any) => 
    fetchFromAPI<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  put: <T = any>(endpoint: string, data?: any) => 
    fetchFromAPI<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  delete: <T = any>(endpoint: string) => 
    fetchFromAPI<T>(endpoint, { method: 'DELETE' }),
};

// Smart Summary specific methods
export const smartSummaryApi = {
  // Create smart summary
  createSmartSummary: (data: {
    youtube_url?: string;
    voice_file?: string;
    tone: string;
    max_length: number;
    use_agent: boolean;
    include_similar: boolean;
  }) => api.post('/api/v1/smart-summary', data),

  // Search summaries
  searchSummaries: (data: {
    query: string;
    user_id?: string;
    top_k: number;
  }) => api.post('/api/v1/search-summaries', data),

  // Get user summaries
  getUserSummaries: (limit: number = 50) => 
    api.get(`/api/v1/user-summaries?limit=${limit}`),

  // Delete summary
  deleteSummary: (vectorId: string) => 
    api.delete(`/api/v1/summary/${vectorId}`),

  // Get summary stats
  getSummaryStats: () => api.get('/api/v1/summary-stats'),
};

// Example usage:
// const result = await api.get('/summary/123');
// const result = await api.post('/summary', { text: 'Hello world' });
// const smartResult = await smartSummaryApi.createSmartSummary({ youtube_url: '...', tone: 'professional' }); 