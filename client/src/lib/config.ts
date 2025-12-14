// Runtime configuration for API URL
// HARDCODED to avoid Vite build-time environment variable issues

// Production Railway backend URL - hardcoded because VITE_API_URL doesn't work at build time
const RAILWAY_URL = 'https://tt-confidence-hub-production.up.railway.app';

export function getApiUrl(): string {
  // Check if we're in a browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development - use local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  
  // For all production/deployed environments, use Railway
  return RAILWAY_URL;
}

// Use the getter function to ensure runtime evaluation
export const API_URL = getApiUrl();
