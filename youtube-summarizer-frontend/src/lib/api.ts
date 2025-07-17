import axios from 'axios';
import { auth } from './firebase';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
  }
  return config;
});

// API endpoints
export const apiEndpoints = {
  // Summary endpoints
  createSummary: '/summary',
  getSummaries: '/summaries',
  getSummary: (id: string) => `/summary/${id}`,
  
  // User endpoints
  getUserProfile: '/user/profile',
  updateUserProfile: '/user/profile',
};

// API methods
export const apiMethods = {
  // Create YouTube summary
  createSummary: async (youtubeUrl: string) => {
    const response = await api.post(apiEndpoints.createSummary, {
      youtube_url: youtubeUrl,
    });
    return response.data;
  },

  // Get all summaries for the authenticated user
  getSummaries: async () => {
    const response = await api.get(apiEndpoints.getSummaries);
    return response.data;
  },

  // Get specific summary by ID
  getSummary: async (id: string) => {
    const response = await api.get(apiEndpoints.getSummary(id));
    return response.data;
  },

  // Get user profile
  getUserProfile: async () => {
    const response = await api.get(apiEndpoints.getUserProfile);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (profileData: Record<string, unknown>) => {
    const response = await api.put(apiEndpoints.updateUserProfile, profileData);
    return response.data;
  },
};

export default api;