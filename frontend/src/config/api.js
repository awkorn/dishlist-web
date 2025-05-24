/**
 * Configuration utility for API endpoints
 * Determines correct backend URL based on environment
 */
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Production environments
  if (hostname === 'dishlist-web.vercel.app' || 
      hostname === 'dishlist-frontend.vercel.app') {
    return 'https://dishlist-backend.vercel.app';
  }
  
  // Default to localhost for development
  return 'http://localhost:5000';
};

// API URLs
export const API_BASE_URL = getApiBaseUrl();
export const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
export const AI_API_URL = `${API_BASE_URL}/api`;

// AI endpoint routes
export const AI_ENDPOINTS = {
  NUTRITION: `${AI_API_URL}/nutrition`,
  GENERATE_RECIPE: `${AI_API_URL}/generate-recipe`,
  PARSE_RECIPE: `${AI_API_URL}/parse-recipe`,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  API_BASE_URL,
  GRAPHQL_URL,
  AI_API_URL,
  AI_ENDPOINTS,
};